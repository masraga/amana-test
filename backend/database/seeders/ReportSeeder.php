<?php

namespace Database\Seeders;

use App\Models\Report;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReportSeeder extends Seeder
{
    public function run(): void
    {
        $reporter = User::where('email', 'reporter@amana.test')->first();

        if (!$reporter) {
            return;
        }

        Report::factory()->count(3)->create(['user_id' => $reporter->id]);
        Report::factory()->count(3)->submitted()->create(['user_id' => $reporter->id]);
        Report::factory()->count(2)->underReview()->create(['user_id' => $reporter->id]);
        Report::factory()->count(2)->resolved()->create(['user_id' => $reporter->id]);
    }
}
