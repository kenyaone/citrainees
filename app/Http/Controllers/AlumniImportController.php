<?php

namespace App\Http\Controllers;

use App\Models\Alumni;
use App\Models\CiProject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class AlumniImportController extends Controller
{
    private const COLUMNS = [
        'first_name', 'middle_name', 'last_name',
        'ci_project_code',
        'date_of_birth', 'gender', 'county', 'sub_county',
        'sponsorship_start_year', 'sponsorship_end_year', 'form_four_year',
        'kcse_index_number', 'kcse_mean_grade',
        'current_status', 'phone_primary', 'email_secondary',
    ];

    public function show()
    {
        return Inertia::render('alumni/import', [
            'columns' => self::COLUMNS,
            'projects' => CiProject::orderBy('code')->get(['id', 'code', 'name']),
        ]);
    }

    public function template()
    {
        $csv = implode(',', self::COLUMNS)."\n"
            .'Wanjiru,Mary,Kamau,KE-0001,2000-05-14,female,Nakuru,Bahati,2015,2018,2018,123456789,B+,studying,,'."\n"
            .'John,,Otieno,KE-0002,1998-11-02,male,Kisumu,Kisumu Central,2010,2015,2015,987654321,C+,employed,+254712345678,john.otieno@example.com'."\n";

        return Response::make($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="alumni-import-template.csv"',
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimetypes:text/csv,text/plain,application/csv', 'max:5120'],
        ]);

        $handle = fopen($request->file('file')->getRealPath(), 'r');
        if (! $handle) {
            return back()->with('error', 'Could not read the uploaded file.');
        }

        $header = fgetcsv($handle);
        if (! $header) {
            fclose($handle);
            return back()->with('error', 'The CSV appears to be empty.');
        }

        $header = array_map(fn ($h) => strtolower(trim((string) $h)), $header);
        $requiredColumns = ['first_name', 'last_name'];
        $missing = array_diff($requiredColumns, $header);
        if (! empty($missing)) {
            fclose($handle);
            return back()->with('error', 'Missing required columns: '.implode(', ', $missing));
        }

        $projectLookup = CiProject::pluck('id', 'code')->all();

        $imported = 0;
        $skipped = [];
        $rowsToInsert = [];
        $rowNumber = 1;

        while (($row = fgetcsv($handle)) !== false) {
            $rowNumber++;
            if (count(array_filter($row, fn ($v) => trim((string) $v) !== '')) === 0) {
                continue;
            }

            $data = [];
            foreach ($header as $i => $col) {
                $value = $row[$i] ?? null;
                $data[$col] = ($value === null || trim((string) $value) === '') ? null : trim((string) $value);
            }

            $projectId = null;
            if (! empty($data['ci_project_code'])) {
                $projectId = $projectLookup[$data['ci_project_code']] ?? null;
                if ($projectId === null) {
                    $skipped[] = ['row' => $rowNumber, 'reason' => "Unknown ci_project_code '{$data['ci_project_code']}'"];
                    continue;
                }
            }

            $payload = [
                'first_name' => $data['first_name'] ?? null,
                'middle_name' => $data['middle_name'] ?? null,
                'last_name' => $data['last_name'] ?? null,
                'ci_project_id' => $projectId,
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'gender' => $data['gender'] ?? null,
                'county' => $data['county'] ?? null,
                'sub_county' => $data['sub_county'] ?? null,
                'sponsorship_start_year' => $data['sponsorship_start_year'] ?? null,
                'sponsorship_end_year' => $data['sponsorship_end_year'] ?? null,
                'form_four_year' => $data['form_four_year'] ?? null,
                'kcse_index_number' => $data['kcse_index_number'] ?? null,
                'kcse_mean_grade' => $data['kcse_mean_grade'] ?? null,
                'current_status' => $data['current_status'] ?? null,
                'phone_primary' => $data['phone_primary'] ?? null,
                'email_secondary' => $data['email_secondary'] ?? null,
            ];

            $validator = Validator::make($payload, [
                'first_name' => ['required', 'string', 'max:100'],
                'last_name' => ['required', 'string', 'max:100'],
                'middle_name' => ['nullable', 'string', 'max:100'],
                'date_of_birth' => ['nullable', 'date'],
                'gender' => ['nullable', 'in:female,male,other,prefer_not_to_say'],
                'county' => ['nullable', 'string', 'max:64'],
                'sub_county' => ['nullable', 'string', 'max:64'],
                'sponsorship_start_year' => ['nullable', 'integer', 'min:1980', 'max:2100'],
                'sponsorship_end_year' => ['nullable', 'integer', 'min:1980', 'max:2100'],
                'form_four_year' => ['nullable', 'integer', 'min:1980', 'max:2100'],
                'kcse_mean_grade' => ['nullable', 'string', 'max:4'],
                'current_status' => ['nullable', 'in:studying,employed,self_employed,unemployed,seeking,unknown'],
                'phone_primary' => ['nullable', 'string', 'max:32'],
                'email_secondary' => ['nullable', 'email', 'max:255'],
            ]);

            if ($validator->fails()) {
                $skipped[] = [
                    'row' => $rowNumber,
                    'reason' => collect($validator->errors()->all())->implode('; '),
                ];
                continue;
            }

            $rowsToInsert[] = $payload;
        }

        fclose($handle);

        DB::transaction(function () use ($rowsToInsert, &$imported) {
            foreach ($rowsToInsert as $payload) {
                Alumni::create($payload);
                $imported++;
            }
        });

        return redirect()
            ->route('alumni.index')
            ->with('success', "Imported {$imported} alumni.".(count($skipped) > 0 ? ' '.count($skipped).' row(s) skipped.' : ''))
            ->with('import_skipped', $skipped);
    }
}
