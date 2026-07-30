<?php

namespace Database\Seeders;

use App\Models\Skill;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SkillSeeder extends Seeder
{
    public function run(): void
    {
        $vocabulary = [
            'ICT & Software' => [
                'Software Development', 'Web Design', 'Mobile App Development',
                'Data Analysis', 'Networking', 'Cybersecurity', 'Graphic Design',
                'Digital Marketing', 'Computer Repair',
            ],
            'Healthcare' => [
                'Nursing', 'Clinical Medicine', 'Pharmacy', 'Nutrition',
                'Community Health', 'Medical Laboratory', 'Caregiving',
            ],
            'Engineering & Trades' => [
                'Electrical Installation', 'Plumbing', 'Motor Vehicle Mechanics',
                'Welding & Fabrication', 'Masonry', 'Carpentry', 'Solar Installation',
                'Civil Engineering', 'Mechanical Engineering',
            ],
            'Hospitality & Tourism' => [
                'Food & Beverage', 'Culinary Arts', 'Front Office Operations',
                'Housekeeping', 'Tour Guiding',
            ],
            'Agriculture' => [
                'Crop Production', 'Animal Husbandry', 'Agribusiness', 'Horticulture',
                'Agricultural Extension',
            ],
            'Business & Finance' => [
                'Accounting', 'Banking', 'Sales & Marketing', 'Entrepreneurship',
                'Supply Chain Management', 'Human Resource Management',
            ],
            'Education' => [
                'Early Childhood Education', 'Primary Teaching', 'Secondary Teaching',
                'TVET Instruction',
            ],
            'Creative & Media' => [
                'Photography', 'Videography', 'Journalism', 'Music Production',
                'Fashion Design', 'Cosmetology',
            ],
            'Transport & Logistics' => [
                'Driving', 'Logistics', 'Aviation',
            ],
        ];

        foreach ($vocabulary as $category => $skills) {
            foreach ($skills as $name) {
                Skill::updateOrCreate(
                    ['slug' => Str::slug($name)],
                    ['name' => $name, 'category' => $category]
                );
            }
        }
    }
}
