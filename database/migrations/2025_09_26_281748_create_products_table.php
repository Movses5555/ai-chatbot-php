<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->integer('title_id');
            $table->longText('description_id');
            $table->integer('category_id');
            $table->integer('brand_id');
            $table->boolean('is_top')->default(0);
            $table->boolean('is_banner')->default(0);
            $table->integer('general_image_id')->nullable();
            $table->integer('admin_id');
            $table->integer('last_updated_admin_id')->nullable();
            $table->integer('price');
            $table->integer('discount');
            $table->integer('free_shipping_distance')->default(0);
            $table->integer('free_shipping_distance_type_id')->default(2);
            $table->integer('in_stock')->default(0);
            $table->string('currency')->default('USD');
            $table->integer('rate')->nullable();
            $table->enum('status',[0, 1])->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('products');
    }
};
