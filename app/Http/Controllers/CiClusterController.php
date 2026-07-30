<?php

namespace App\Http\Controllers;

use App\Models\CiCluster;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CiClusterController extends Controller
{
    public function index(): Response
    {
        $clusters = CiCluster::withCount('projects')
            ->orderBy('name')
            ->get();

        return Inertia::render('ci-clusters/index', [
            'clusters' => $clusters,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        CiCluster::create($data);

        return back()->with('success', 'Cluster added.');
    }

    public function update(Request $request, CiCluster $ciCluster): RedirectResponse
    {
        $data = $this->validated($request, $ciCluster->id);
        $ciCluster->update($data);

        return back()->with('success', 'Cluster updated.');
    }

    public function destroy(CiCluster $ciCluster): RedirectResponse
    {
        if ($ciCluster->projects()->exists()) {
            return back()->with('error', 'Cannot delete a cluster that has projects. Reassign or delete the projects first.');
        }

        $ciCluster->delete();

        return back()->with('success', 'Cluster removed.');
    }

    private function validated(Request $request, ?int $clusterId = null): array
    {
        return $request->validate([
            'code' => ['required', 'string', 'max:32', Rule::unique('ci_clusters', 'code')->ignore($clusterId)],
            'name' => ['required', 'string', 'max:255'],
            'region' => ['nullable', 'string', 'max:64'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);
    }
}
