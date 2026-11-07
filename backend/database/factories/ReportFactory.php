<?php

namespace Database\Factories;

use App\Models\Report;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Report>
 */
class ReportFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        $date = now()->format('Ymd');
        $suffix = strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 5));

        return [
            'reference_number' => "RPT-{$date}-{$suffix}",
            'user_id' => User::factory(),
            'title' => fake()->sentence(4),
            'category' => fake()->randomElement(['fraud', 'harassment', 'safety', 'corruption', 'other']),
            'description' => fake()->paragraphs(2, true),
            'incident_date' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'status' => 'draft',
        ];
    }

    public function submitted(): static
    {
        return $this->state(['status' => 'submitted']);
    }

    public function underReview(): static
    {
        return $this->state(['status' => 'under_review']);
    }

    public function resolved(): static
    {
        return $this->state(['status' => 'resolved']);
    }
}
