<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = [
            [
                'id' => 1,
                'name' => 'Laptop',
                'price' => 1200,
                'image' => 'https://cdn.mos.cms.futurecdn.net/FUi2wwNdyFSwShZZ7LaqWf.jpg',
                'description' => 'A powerful laptop for all your computing needs.'
            ],
            [
                'id' => 2,
                'name' => 'Mouse',
                'price' => 25,
                'image' => 'https://m.media-amazon.com/images/I/61LtuGzXeaL._AC_SL1500_.jpg',
                'description' => 'A wireless mouse with a comfortable design.'
            ],
            [
                'id' => 3,
                'name' => 'Keyboard',
                'price' => 75,
                'image' => 'https://m.media-amazon.com/images/I/61QxkJGYxeL._UF1000,1000_QL80_.jpg',
                'description' => 'A mechanical keyboard with RGB lighting.'
            ]
        ];

        return response()->json($products, 200);
        // return Product::all();
    }
}
