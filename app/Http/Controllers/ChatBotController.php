<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\ProductText;
use Illuminate\Http\Request;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class ChatBotController extends Controller
{
    protected $openaiClient;
    protected $availableCategories;

    public function __construct()
    {
        $this->openaiClient = new Client([
            'base_uri' => 'https://api.openai.com/v1/',
            'headers' => [
                'Authorization' => 'Bearer ' . env('OPENAI_API_KEY'),
                'Content-Type' => 'application/json',
            ],
        ]);
        
        $this->availableCategories = Category::whereHas('products', function ($query) {
                $query->where('status', '1')
                    ->where('in_stock', '>', 0);
            })
            ->pluck('name')
            ->implode(', ');
    }

    public function handleMessage(Request $request)
    {
        \Log::info('Received user message: ' . $request->input('message'));
        $userMessage = $request->input('message');
        $categoryNames = [];
        $generalCategory = true;

        try {
            $response = $this->openaiClient->post('chat/completions', [
                'json' => [
                    'model' => 'gpt-4o-mini',
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => "You are a category classifier. Your only task is to identify ALL product categories the user's message is asking about from the list: [{$this->availableCategories}]. If multiple categories are mentioned, return all of them exactly as they appear in the list. If it is a general greeting or not product related, return an empty array []. **Return the output strictly as a JSON object with a single key 'categories' being an array of strings**."
                ],
                        ['role' => 'user', 'content' => $userMessage],
                    ],
                    'response_format' => ['type' => 'json_object'],
                    'temperature' => 0.0,
                ],
            ]);

            $result = json_decode($response->getBody()->getContents(), true);
            $aiClassification = $result['choices'][0]['message']['content'];
            $classificationData = json_decode($aiClassification, true);
            
            \Log::info('Category classification result: ' . $aiClassification);
            $categoryNames = $classificationData['categories'] ?? [];
            if (!empty($categoryNames)) {
                $generalCategory = false;
            }
        } catch (\Exception $e) {
            \Log::error("Category Classification Error: " . $e->getMessage());
            return response()->json(['message' => 'Sorry, I am having trouble connecting to my brain. Please try again later.'], 500);
        }



        \Log::info('Extracted categories: ' . implode(', ', $categoryNames));

        
         // Verify categories exist and have products
        $verifiedCategoryNames = [];

        if (!empty($categoryNames)) {
            foreach ($categoryNames as $name) {
                $category = Category::where('name', $name)->first();
                
                if ($category) {
                    $hasAvailableProducts = $category->products()
                                                    ->where('status', '1')
                                                    ->where('in_stock', '>', 0)
                                                    ->exists();
                    
                    if ($hasAvailableProducts) {
                        $verifiedCategoryNames[] = $name;
                    }
                }
            }
            
            $categoryNames = $verifiedCategoryNames;
            
            if (empty($categoryNames)) {
                $generalCategory = true;
            } else {
                $generalCategory = false;
            }
        }

        \Log::info('Verified categories with products: ' . implode(', ', $categoryNames));

        $products = collect();
        $foundCategoriesCount = count($categoryNames);
        $maxTotalProducts = 10;


        if ($foundCategoriesCount > 0) {
            if ($foundCategoriesCount >= $maxTotalProducts) {
                $limitPerCategory = 1; 
            } elseif ($foundCategoriesCount > 5) {
                $limitPerCategory = 1;
            } else {
                $targetMinProducts = 5;
                $limitPerCategory = ceil($targetMinProducts / $foundCategoriesCount);
            }

            foreach ($categoryNames as $name) {
                if ($products->count() >= $maxTotalProducts) {
                    break; 
                }

                $category = Category::where('name', $name)->first();
                
                if ($category) {
                    try {
                        $remainingLimit = $maxTotalProducts - $products->count();
                        $currentLimit = min($limitPerCategory, $remainingLimit);

                        if ($currentLimit <= 0) {
                            break; 
                        }

                        $categoryProducts = $category->products()
                            ->where('status', '1')
                            ->where('in_stock', '>', 0)
                            ->with(['text', 'brand', 'generalImage'])
                            ->take($currentLimit)
                            ->get();

                        $products = $products->merge($categoryProducts);
                        
                    } catch (\Exception $e) {
                        continue; 
                    }
                }
            }
            $generalCategory = $products->isEmpty();
        } else {
            $generalCategory = true;
        }

        \Log::info('Total products fetched: ' . $products->count());
                
        $fullProductsData = $products->map(function($p) {
            $productArray = $p->toArray();

            $productArray['name'] = $p->text?->title ?? 'N/A';
            $productArray['description'] = $p->text?->description ?? 'N/A';
            $productArray['brand_name'] = $p->brand?->name ?? 'N/A';

            $productArray['image_url'] = $p->generalImage?->url ?? null;
            $productArray['slug'] = 'product-' . $p->id;
            
            unset($productArray['title_id']);
            unset($productArray['description_id']);
            unset($productArray['general_image_id']);
            unset($productArray['brand_id']);

            return $productArray;
        })->keyBy('id')->toArray();
        \Log::info('Full products data prepared for AI: ' . json_encode($fullProductsData));

         // Prepare product context for AI

        $productContext = "No specific products found.";

        if ($products->isNotEmpty()) {
            $productContext = $products
                ->map(fn($p) => 
                    "Product ID: {$p->id}, 
                    Name: " . ($p->text?->title ?? 'N/A') . ", 
                    Brand: " . ($p->brand?->name ?? 'N/A') . ", 
                    Price: \${$p->price}, 
                    Discount: {$p->discount}%,
                    Features: " . ($p->text?->description ?? 'N/A') . "", 
                )
                ->implode(";\n");
        }

        \Log::info('Product context for AI: ' . $productContext);

        $systemPrompt = "You are a product selection AI. Your task is to analyze the user's request and the provided product list, and select the top 5 most relevant product IDs.

        **Instructions for JSON Output:**
        1.  The JSON MUST have two keys: **'text_response'** (string) and **'selected_ids'** (an array of integers or null).
        2.  **Product Context includes:** Product ID, Name, Brand, Price, Discount percentage, and Features (snippet of description).
        3.  **If the Product List is NOT 'No specific products found.':**
            a. Analyze the user message based on Name, Price, Brand, and Discount, and return the IDs of the top 5 most relevant products.
            b. 'selected_ids' value MUST be an **ARRAY of product IDs (integers)**.
        4.  **If the Product List is 'No specific products found.' or category is GENERAL...:**
            a. Set 'selected_ids' to **null**.;
            b. Use 'text_response' to offer general help and note that categories {$this->availableCategories}, but keep in mind that if the conversation is clearly about a specific category or categories, mention only the relevant categories when necessary.";
        
        
        try {
            $response = $this->openaiClient->post('chat/completions', [
                'json' => [
                    'model' => 'gpt-4o-mini',
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'system', 'content' => "Available Products:\n" . $productContext],
                        ['role' => 'user', 'content' => $userMessage],
                    ],
                    'temperature' => 0.7,
                    'response_format' => ['type' => 'json_object'],
                ],
            ]);

            $responseBody = $response->getBody()->getContents();
            $result = json_decode($responseBody, true);

            $aiJsonContent = $result['choices'][0]['message']['content'];
            $finalData = json_decode($aiJsonContent, true); 
            \Log::info('Final AI response data: ' . $aiJsonContent);
            $selectedIds = $finalData['selected_ids'] ?? null;
            $finalProductsList = [];

            if (!empty($selectedIds) && is_array($selectedIds) && !empty($fullProductsData)) {
                
                foreach ($selectedIds as $id) {
                    $id = (int)$id;
                    if (isset($fullProductsData[$id])) {
                        $product = $fullProductsData[$id];
                        $finalProductsList[] = [
                            'id' => $product['id'],
                            'name' => $product['name'],
                            'price' => $product['price'],
                            'description' => $product['description'],
                            'currency' => $product['currency'] ?? 'USD',
                            'discount' => $product['discount'] ?? 0,
                            'brand_name' => $product['brand_name'] ?? 'N/A',
                            'slug' => $product['slug'],
                            'image_url' => $product['image_url'],
                        ];
                    }
                }
            }

            $finalMessage = $finalData['text_response'] ?? "Error processing AI response.";

            return response()->json([
                'message' => $finalMessage,
                'products' => empty($finalProductsList) ? null : $finalProductsList,
                'category_searched' => $categoryNames,
            ]);
            
        } catch (\Exception $e) {
            \Log::error("AI Final Answer Error: " . $e->getMessage());
            return response()->json(['message' => 'An unexpected error occurred during the final response generation.'], 500);
        }

    }
}
