<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@amana.test'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role' => 'administrator',
            ]
        );

        User::firstOrCreate(
            ['email' => 'reporter@amana.test'],
            [
                'name' => 'Reporter User',
                'password' => Hash::make('password'),
                'role' => 'reporter',
            ]
        );
    }
}
