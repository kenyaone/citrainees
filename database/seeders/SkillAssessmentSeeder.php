<?php

namespace Database\Seeders;

use App\Models\Skill;
use App\Models\SkillAssessment;
use Illuminate\Database\Seeder;

class SkillAssessmentSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedAssessment(
            skillSlug: 'digital-marketing',
            title: 'Digital Marketing Fundamentals',
            description: 'A 10-question assessment covering basic digital marketing concepts, channels, and metrics. Pass with 70% or higher to verify this skill.',
            questions: [
                ['q' => 'Which metric measures how often people click your ad after seeing it?', 'options' => ['Bounce rate', 'Click-through rate (CTR)', 'Conversion rate', 'Impressions'], 'correct' => 1],
                ['q' => 'SEO stands for:', 'options' => ['Search Engine Optimization', 'Social Engine Output', 'Server Engine Operations', 'Site Editing Options'], 'correct' => 0],
                ['q' => 'Which of the following is a paid advertising channel?', 'options' => ['Organic social posts', 'Google Ads', 'Word of mouth', 'RSS feeds'], 'correct' => 1],
                ['q' => 'A "landing page" is:', 'options' => ['The first page a visitor sees on your site', 'A specific page designed for one campaign or offer', 'Your homepage', 'The site footer'], 'correct' => 1],
                ['q' => 'What does CTA mean in marketing copy?', 'options' => ['Content Traffic Analysis', 'Call To Action', 'Client Targeting Approach', 'CostTicket Amount'], 'correct' => 1],
                ['q' => 'Which platform is best suited for B2B professional targeting?', 'options' => ['TikTok', 'Snapchat', 'LinkedIn', 'Instagram Stories'], 'correct' => 2],
                ['q' => 'Which tool is commonly used to track website visitor behavior?', 'options' => ['Google Analytics', 'Microsoft Word', 'Slack', 'Notepad'], 'correct' => 0],
                ['q' => 'Conversion rate is calculated as:', 'options' => ['Total visits / conversions', 'Conversions / total visits × 100', 'Impressions / clicks', 'Ad spend / revenue'], 'correct' => 1],
                ['q' => 'A "cold email" is:', 'options' => ['An email sent to someone you have no prior relationship with', 'An email marked as spam', 'An email sent late at night', 'An email in plain text only'], 'correct' => 0],
                ['q' => 'Retargeting (or remarketing) ads are shown to:', 'options' => ['Brand new users', 'Users who have previously visited your site or engaged with you', 'Only users on mobile', 'Only users in your city'], 'correct' => 1],
            ],
        );

        $this->seedAssessment(
            skillSlug: 'accounting',
            title: 'Basic Accounting Principles',
            description: '10 multiple-choice questions on fundamental accounting concepts every entry-level accountant or bookkeeper should know.',
            questions: [
                ['q' => 'The basic accounting equation is:', 'options' => ['Assets = Liabilities + Equity', 'Assets = Revenue - Expenses', 'Equity = Assets + Liabilities', 'Revenue = Assets + Expenses'], 'correct' => 0],
                ['q' => 'A "debit" entry in a cash account:', 'options' => ['Decreases cash', 'Increases cash', 'Has no effect', 'Only applies to loans'], 'correct' => 1],
                ['q' => 'Which of these is an asset?', 'options' => ['Salary payable', 'Accounts receivable', 'Rent expense', 'Sales revenue'], 'correct' => 1],
                ['q' => 'Depreciation is:', 'options' => ['An increase in asset value', 'The allocation of an asset\'s cost over its useful life', 'A tax refund', 'A form of loan interest'], 'correct' => 1],
                ['q' => 'The document showing income and expenses over a period is the:', 'options' => ['Balance sheet', 'Income statement (P&L)', 'Cash flow statement', 'Trial balance'], 'correct' => 1],
                ['q' => 'Double-entry bookkeeping means every transaction affects:', 'options' => ['One account', 'At least two accounts', 'Exactly three accounts', 'Only cash accounts'], 'correct' => 1],
                ['q' => 'A liability is:', 'options' => ['Something the business owns', 'Something the business owes', 'Owner\'s investment', 'Revenue earned'], 'correct' => 1],
                ['q' => 'Which principle requires expenses to be recorded in the same period as the revenue they helped generate?', 'options' => ['Going concern principle', 'Matching principle', 'Cost principle', 'Materiality principle'], 'correct' => 1],
                ['q' => 'Accounts receivable represents:', 'options' => ['Money owed by customers', 'Money owed to suppliers', 'Cash in the bank', 'Owner withdrawals'], 'correct' => 0],
                ['q' => 'A trial balance is prepared to:', 'options' => ['Show profit', 'Check that debits equal credits', 'Report to tax authorities', 'Calculate depreciation'], 'correct' => 1],
            ],
        );

        $this->seedAssessment(
            skillSlug: 'web-design',
            title: 'Web Design Fundamentals',
            description: 'Tests understanding of HTML, CSS, responsive design, and basic UX principles.',
            questions: [
                ['q' => 'HTML stands for:', 'options' => ['Hyper Transfer Markup Language', 'HyperText Markup Language', 'HighText Machine Language', 'Home Tool Markup Language'], 'correct' => 1],
                ['q' => 'Which CSS property controls text color?', 'options' => ['text-color', 'font-color', 'color', 'foreground'], 'correct' => 2],
                ['q' => 'The `<a>` tag is used for:', 'options' => ['Images', 'Anchors / links', 'Audio', 'Alignment'], 'correct' => 1],
                ['q' => 'Responsive design means:', 'options' => ['Site loads fast', 'Layout adapts to different screen sizes', 'Uses only images', 'Requires JavaScript'], 'correct' => 1],
                ['q' => 'Which CSS unit is relative to the root font size?', 'options' => ['px', 'em', 'rem', 'pt'], 'correct' => 2],
                ['q' => 'The correct HTML element for the largest heading is:', 'options' => ['<heading>', '<h6>', '<h1>', '<head>'], 'correct' => 2],
                ['q' => 'To include a stylesheet you use:', 'options' => ['<style src="...">', '<link rel="stylesheet" href="...">', '<css href="...">', '<script src="style.css">'], 'correct' => 1],
                ['q' => 'Which is a semantic HTML element?', 'options' => ['<div>', '<span>', '<article>', '<b>'], 'correct' => 2],
                ['q' => 'Accessibility (a11y) means:', 'options' => ['Faster loading pages', 'Making sites usable by people with disabilities', 'Search engine optimization', 'Mobile-only design'], 'correct' => 1],
                ['q' => 'A CSS "media query" is used to:', 'options' => ['Play videos', 'Apply styles conditionally based on device features', 'Load external CSS files', 'Cache the page'], 'correct' => 1],
            ],
        );
    }

    private function seedAssessment(string $skillSlug, string $title, string $description, array $questions): void
    {
        $skill = Skill::where('slug', $skillSlug)->first();
        if (! $skill) {
            return;
        }

        $assessment = SkillAssessment::updateOrCreate(
            ['skill_id' => $skill->id, 'title' => $title],
            [
                'description' => $description,
                'pass_threshold' => 70,
                'time_limit_minutes' => 15,
                'is_active' => true,
            ],
        );

        $assessment->questions()->delete();

        foreach ($questions as $index => $q) {
            $assessment->questions()->create([
                'question_text' => $q['q'],
                'options' => $q['options'],
                'correct_index' => $q['correct'],
                'points' => 1,
                'order_index' => $index,
            ]);
        }
    }
}
