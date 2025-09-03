<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run()
    {
        Product::insert([
            [
                'name' => 'iPhone 15',
                'price' => 1200,
                'image_url' => 'https://cdn0.it4profit.com/s3sizesize/el:t/rt:fill/plain/s3://cms/product/9f/1d/9f1d4f9854ec75400235a253f0fb2f68/250331120138370414.webp'
            ],
            [
                'name' => 'Samsung Galaxy S24',
                'price' => 1000,
                'image_url' => 'https://www.mobilecentre.am/img/prodpic/6c7b9de3950164b00881%D0%9D%D0%BE%D0%B2%D1%8B%D0%B9_%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82.png'
            ],
            [
                'name' => 'Xiaomi Redmi Note 13',
                'price' => 400,
                'image_url' => 'https://eldorado.am/media/catalog/product/cache/b636eac9f5e866652b5cbe8cee86d97c/r/e/redmi_note_13_6gb128gb_ice_blue_6.jpg'
            ]
        ]);
    }
}
