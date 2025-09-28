<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'title_id', 'description_id', 'category_id', 'brand_id', 'price', 
        'discount', 'in_stock', 'currency', 'status', 'admin_id',
    ];

    public function text()
    {
        return $this->belongsTo(ProductText::class, 'title_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function generalImage()
    {
        return $this->belongsTo(\App\Models\Image::class, 'general_image_id'); 
    }
    
    public function brand()
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }

    public function getNameAttribute()
    {
        return $this->text->title ?? 'N/A';
    }

    public function getDescriptionAttribute()
    {
        return $this->text->description ?? 'N/A';
    }

    public function getBrandNameAttribute()
    {
        return $this->brand->name ?? 'Unknown';
    }

}
