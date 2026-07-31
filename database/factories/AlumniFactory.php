<?php

namespace Database\Factories;

use App\Models\Alumni;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Alumni>
 */
class AlumniFactory extends Factory
{
    protected $model = Alumni::class;

    private const MALE_FIRST = [
        'Kevin', 'Brian', 'John', 'David', 'Peter', 'James', 'Mark', 'Michael', 'Daniel',
        'Kipchoge', 'Otieno', 'Wafula', 'Mwangi', 'Kamau', 'Njoroge', 'Ochieng', 'Odhiambo',
        'Nyongesa', 'Kiplangat', 'Mutua', 'Munyao', 'Karanja', 'Onyango', 'Abdi', 'Hassan',
        'Ali', 'Baraka', 'Juma', 'Rashid', 'Salim', 'Kiptoo', 'Cheruiyot', 'Kibet',
    ];

    private const FEMALE_FIRST = [
        'Wanjiru', 'Nyambura', 'Njeri', 'Achieng', 'Adhiambo', 'Nekesa', 'Chebet',
        'Chepkirui', 'Wanjiku', 'Mueni', 'Muthoni', 'Kagure', 'Grace', 'Faith', 'Mercy',
        'Sharon', 'Sarah', 'Jane', 'Ann', 'Susan', 'Aisha', 'Fatuma', 'Zainab', 'Halima',
        'Amina', 'Zawadi', 'Mwikali', 'Kavata', 'Nasieku', 'Auma', 'Anyango', 'Wangari',
    ];

    private const SURNAMES = [
        'Kamau', 'Wanjiru', 'Otieno', 'Odhiambo', 'Achieng', 'Wafula', 'Barasa', 'Nyongesa',
        'Kipchoge', 'Kiptoo', 'Kiplangat', 'Cheruiyot', 'Chepkurui', 'Mwangi', 'Njoroge',
        'Karanja', 'Kiarie', 'Muthoni', 'Njeri', 'Mutua', 'Munyao', 'Kilonzo', 'Abdi',
        'Hassan', 'Ali', 'Ochieng', 'Onyango', 'Owino', 'Chege', 'Wambui', 'Wangeci',
        'Nyongo', 'Owiti', 'Omondi', 'Simiyu', 'Wekesa', 'Chelagat', 'Rono', 'Sang',
    ];

    // Weighted county pool — more populous counties appear more often
    private const COUNTY_POOL = [
        'Nairobi', 'Nairobi', 'Nairobi', 'Nairobi',
        'Kiambu', 'Kiambu', 'Kiambu',
        'Nakuru', 'Nakuru', 'Nakuru',
        'Kisumu', 'Kisumu',
        'Mombasa', 'Mombasa',
        'Kakamega', 'Kakamega',
        'Bungoma', 'Machakos', 'Meru', 'Uasin Gishu', 'Kilifi',
        'Muranga', 'Nyeri', 'Kericho', 'Kisii', 'Bomet',
        'Turkana', 'West Pokot', 'Migori', 'Homa Bay', 'Busia',
        'Trans-Nzoia', 'Nandi', 'Baringo', 'Laikipia', 'Kajiado',
        'Makueni', 'Kitui', 'Embu', 'Tharaka Nithi', 'Marsabit',
        'Isiolo', 'Wajir', 'Garissa', 'Mandera', 'Samburu',
        'Tana River', 'Lamu', 'Kwale', 'Taita Taveta',
        'Nyandarua', 'Kirinyaga', 'Elgeyo Marakwet', 'Narok', 'Vihiga',
        'Nyamira', 'Kirinyaga',
    ];

    // Explicitly map to Kenyan counties present in config/kenya_counties.php
    private const COUNTIES_CANONICAL = [
        'Muranga' => "Murang'a",
    ];

    public function definition(): array
    {
        $gender = $this->faker->boolean() ? 'female' : 'male';
        $first = $gender === 'female'
            ? $this->faker->randomElement(self::FEMALE_FIRST)
            : $this->faker->randomElement(self::MALE_FIRST);
        $last = $this->faker->randomElement(self::SURNAMES);
        $middle = $this->faker->boolean(60) ? $this->faker->randomElement(self::SURNAMES) : null;

        $formFourYear = $this->faker->numberBetween(2012, 2024);
        $sponsorshipStart = $formFourYear - $this->faker->numberBetween(8, 14);
        $countyRaw = $this->faker->randomElement(self::COUNTY_POOL);
        $county = self::COUNTIES_CANONICAL[$countyRaw] ?? $countyRaw;

        return [
            'first_name' => $first,
            'middle_name' => $middle,
            'last_name' => $last,
            'gender' => $gender,
            'county' => $county,
            'date_of_birth' => now()->subYears($formFourYear - 2008)->subDays($this->faker->numberBetween(0, 365)),
            'sponsorship_start_year' => $sponsorshipStart,
            'sponsorship_end_year' => $formFourYear,
            'form_four_year' => $formFourYear,
            'kcse_mean_grade' => $this->faker->randomElement(['A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+']),
            'current_status' => $this->faker->randomElement([
                'employed', 'employed', 'self_employed', 'studying', 'seeking', 'unknown',
            ]),
            'bio' => $this->faker->boolean(40) ? $this->faker->sentence(15) : null,
            'phone_primary' => '+2547'.$this->faker->numberBetween(10000000, 99999999),
            'is_public' => $this->faker->boolean(30),
            'verified_at' => $this->faker->boolean(60) ? now()->subDays($this->faker->numberBetween(1, 180)) : null,
        ];
    }
}
