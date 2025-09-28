<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Image;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('products')->truncate();
        DB::table('product_texts')->truncate();
        DB::table('categories')->truncate();
        DB::table('brands')->truncate();
        DB::table('images')->truncate();

        $electronics = Category::create(['name' => 'Electronics']);
        $clothing = Category::create(['name' => 'Clothing']);
        $books = Category::create(['name' => 'Books']);
        
        $sony = Brand::create(['name' => 'Sony']);
        $nike = Brand::create(['name' => 'Nike']);
        $apple = Brand::create(['name' => 'Apple']);

        $headphoneImage = Image::create(['url' => '/img/headphones.jpg']);
        $jacketImage = Image::create(['url' => '/img/winter_jacket.jpg']);
        $nikeImage = Image::create(['url' => '/img/nike.jpg']);
        $sonyImage = Image::create(['url' => '/img/sony.jpg']);
        $appleImage = Image::create(['url' => '/img/apple.jpg']);
        $clothingImage = Image::create(['url' => '/img/winter_clothing.jpg']);


        $productsData = [
            [
                'title' => 'Noise Cancelling Headphones',
                'description' => 'Premium over-ear headphones with active noise cancellation. Perfect for travel.',
                'price' => 250,
                'discount' => 10,
                'category_id' => $electronics->id,
                'brand_id' => $sony->id,
                'general_image_id' => $headphoneImage->id,
            ],
            [
                'title' => 'Winter Puffer Jacket',
                'description' => 'Water-resistant puffer jacket with goose down insulation for cold weather.',
                'price' => 180,
                'discount' => 0,
                'category_id' => $clothing->id,
                'brand_id' => $nike->id,
                'general_image_id' => $nikeImage->id,
            ],
            [
                'title' => 'Noise Cancelling Headphones',
                'description' => 'Premium over-ear headphones with active noise cancellation and clear sound. Perfect for travel.',
                'price' => 250,
                'discount' => 10,
                'category_id' => $electronics->id,
                'brand_id' => $sony->id,
                'general_image_id' => $sonyImage->id,
            ],
            [
                'title' => 'Basic USB Mouse',
                'description' => 'Simple 3-button USB mouse for everyday use. No special features.',
                'price' => 15,
                'discount' => 0,
                'category_id' => $electronics->id,
                'brand_id' => $apple->id,
                'general_image_id' => $appleImage->id,
            ],
            [
                'title' => 'Merino Wool Hiking Socks',
                'description' => 'Comfortable merino wool socks, excellent for hiking and moisture wicking. Great value.',
                'price' => 25,
                'discount' => 5,
                'category_id' => $clothing->id,
                'brand_id' => $nike->id,
                'general_image_id' => $clothingImage->id,
            ],
        ];

        foreach ($productsData as $data) {
            $productText = DB::table('product_texts')->insertGetId([
                'title' => $data['title'],
                'description' => $data['description'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            Product::create([
                'title_id' => $productText,
                'description_id' => $productText,
                'category_id' => $data['category_id'],
                'brand_id' => $data['brand_id'],
                'price' => $data['price'],
                'discount' => $data['discount'],
                'general_image_id' => $data['general_image_id'],
                
                'is_top' => 0,
                'is_banner' => 0,
                'general_image_id' => null,
                'admin_id' => 1,
                'last_updated_admin_id' => null,
                'free_shipping_distance' => 0,
                'free_shipping_distance_type_id' => 2,
                'in_stock' => 1,
                'currency' => 'USD',
                'rate' => null,
                'status' => 1, 
            ]);
        }
    }
}
