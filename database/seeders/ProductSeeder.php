<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $electronicsId = Category::where('name', 'Electronics')->value('id');
        $clothingId = Category::where('name', 'Clothing')->value('id');
        $accessoriesId = Category::where('name', 'Accessories')->value('id');
        $booksId = Category::where('name', 'Books')->value('id');
        
        $products = [
            [
                'category_id' => $electronicsId,
                'name' => 'Noise Cancelling Headphones',
                'price' => 199.99,
                'description' => 'Premium over-ear headphones with superior active noise cancellation for travel and work.',
                'image_url' => '/img/products/headphones.jpg',
            ],
            [
                'category_id' => $clothingId,
                'name' => 'Merino Wool Hiking Socks',
                'price' => 25.00,
                'description' => 'Durable and warm socks, excellent for hiking and cold weather. Available in three sizes.',
                'image_url' => '/img/products/socks.jpg',
            ],
            [
                'category_id' => $accessoriesId,
                'name' => 'Leather Wallet',
                'price' => 45.99,
                'description' => 'Slim bifold wallet made from high-quality genuine leather with RFID protection.',
                'image_url' => '/img/products/wallet.jpg',
            ],
            [
                'category_id' => $booksId,
                'name' => 'The Art of Programming',
                'price' => 49.95,
                'description' => 'A fundamental guide to clean code principles and software architecture.',
                'image_url' => '/img/products/programming_book.jpg',
            ],
            [
                'category_id' => $electronicsId,
                'name' => '4K Ultra HD Monitor',
                'price' => 449.00,
                'description' => '27-inch monitor with stunning color accuracy and high refresh rate, perfect for design.',
                'image_url' => '/img/products/monitor.jpg',
            ],
            [
                'category_id' => $clothingId,
                'name' => 'Winter Puffer Jacket',
                'price' => 120.00,
                'description' => 'Lightweight but extremely warm jacket, water-resistant outer shell.',
                'image_url' => '/img/products/jacket.jpg',
            ],
        ];

        foreach ($products as $productData) {
            $slug = Str::slug($productData['name']);
            Product::firstOrCreate(['slug' => $slug], array_merge($productData, ['slug' => $slug]));
        }
    }
}
