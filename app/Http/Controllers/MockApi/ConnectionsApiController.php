<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * ARGUX Connections Graph Mock REST API.
 * Force-directed graph nodes + edges with connection types.
 */
class ConnectionsApiController extends Controller
{
    private static function nodes(): array
    {
        return [
            ['id'=>'p-1','type'=>'person','label'=>'Marko Horvat','subLabel'=>'CEO, Alpha Security','entityId'=>1,'risk'=>'Critical','photo'=>null],
            ['id'=>'p-2','type'=>'person','label'=>'Elena Petrova','subLabel'=>'Finance Director','entityId'=>2,'risk'=>'Medium','photo'=>null],
            ['id'=>'p-3','type'=>'person','label'=>'Ahmed Al-Rashid','subLabel'=>'Investor','entityId'=>3,'risk'=>'Critical','photo'=>null],
            ['id'=>'p-4','type'=>'person','label'=>'Viktor Petrenko','subLabel'=>'Logistics Manager','entityId'=>4,'risk'=>'Medium','photo'=>null],
            ['id'=>'p-5','type'=>'person','label'=>'Ana Kovačević','subLabel'=>'Administrative Asst','entityId'=>5,'risk'=>'Low','photo'=>null],
            ['id'=>'p-6','type'=>'person','label'=>'Marco Rossi','subLabel'=>'Import/Export','entityId'=>6,'risk'=>'Medium','photo'=>null],
            ['id'=>'p-7','type'=>'person','label'=>'Youssef Hassan','subLabel'=>'Arms Procurement','entityId'=>7,'risk'=>'High','photo'=>null],
            ['id'=>'p-8','type'=>'person','label'=>'Dragana Simić','subLabel'=>'Accountant','entityId'=>8,'risk'=>'Low','photo'=>null],
            ['id'=>'p-9','type'=>'person','label'=>'Carlos Mendoza','subLabel'=>'Cartel Liaison','entityId'=>9,'risk'=>'Critical','photo'=>null],
            ['id'=>'p-10','type'=>'person','label'=>'Li Wei','subLabel'=>'Tech Supplier','entityId'=>10,'risk'=>'High','photo'=>null],
            ['id'=>'p-11','type'=>'person','label'=>'Fatima Al-Zahra','subLabel'=>'Courier','entityId'=>11,'risk'=>'High','photo'=>null],
            ['id'=>'p-12','type'=>'person','label'=>'Ivan Babić','subLabel'=>'Security Director','entityId'=>12,'risk'=>'High','photo'=>null],
            ['id'=>'o-1','type'=>'organization','label'=>'Alpha Security Group','subLabel'=>'Private Security','entityId'=>1,'risk'=>'Critical','photo'=>null],
            ['id'=>'o-2','type'=>'organization','label'=>'Rashid Holdings','subLabel'=>'Investment Fund','entityId'=>2,'risk'=>'High','photo'=>null],
            ['id'=>'o-3','type'=>'organization','label'=>'Meridian Logistics','subLabel'=>'Freight Forwarding','entityId'=>3,'risk'=>'High','photo'=>null],
            ['id'=>'o-4','type'=>'organization','label'=>'Dragon Tech Solutions','subLabel'=>'Electronics Import','entityId'=>4,'risk'=>'Medium','photo'=>null],
            ['id'=>'o-5','type'=>'organization','label'=>'Balkan Transit Corp','subLabel'=>'Transport','entityId'=>5,'risk'=>'High','photo'=>null],
            ['id'=>'o-6','type'=>'organization','label'=>'Adriatic Shipping','subLabel'=>'Maritime Logistics','entityId'=>6,'risk'=>'Medium','photo'=>null],
            ['id'=>'o-7','type'=>'organization','label'=>'EuroChem Distribution','subLabel'=>'Chemical Supply','entityId'=>7,'risk'=>'Medium','photo'=>null],
            ['id'=>'o-8','type'=>'organization','label'=>'Meridian Finance Ltd','subLabel'=>'Financial Services','entityId'=>8,'risk'=>'High','photo'=>null],
        ];
    }

    private static function edges(): array
    {
        return [
            ['id'=>'c1','source'=>'p-1','target'=>'p-12','type'=>'Business Partner','relationship'=>'Good','strength'=>5,'notes'=>'Co-founders of Alpha Security Group.','firstSeen'=>'2015-01-01','lastSeen'=>'2026-03-18'],
            ['id'=>'c2','source'=>'p-1','target'=>'o-1','type'=>'Employee','relationship'=>'Neutral','strength'=>5,'notes'=>'CEO of Alpha Security Group.','firstSeen'=>'2009-06-01','lastSeen'=>'2026-03-18'],
            ['id'=>'c3','source'=>'p-12','target'=>'o-1','type'=>'Employee','relationship'=>'Good','strength'=>5,'notes'=>'Security Director.','firstSeen'=>'2015-01-01','lastSeen'=>'2026-03-18'],
            ['id'=>'c4','source'=>'p-1','target'=>'p-2','type'=>'Lover','relationship'=>'Good','strength'=>4,'notes'=>'Ongoing relationship.','firstSeen'=>'2024-02-14','lastSeen'=>'2026-03-15'],
            ['id'=>'c5','source'=>'p-1','target'=>'p-7','type'=>'Business Associate','relationship'=>'Bad','strength'=>3,'notes'=>'Arms procurement channel suspected.','firstSeen'=>'2022-06-10','lastSeen'=>'2026-01-20'],
            ['id'=>'c6','source'=>'p-1','target'=>'p-9','type'=>'Criminal Associate','relationship'=>'Neutral','strength'=>4,'notes'=>'Suspected drug distribution link.','firstSeen'=>'2023-03-15','lastSeen'=>'2026-03-18'],
            ['id'=>'c7','source'=>'p-3','target'=>'o-2','type'=>'Owner','relationship'=>'Good','strength'=>5,'notes'=>'Beneficial owner.','firstSeen'=>'2018-01-01','lastSeen'=>'2026-03-18'],
            ['id'=>'c8','source'=>'p-3','target'=>'p-7','type'=>'Financial','relationship'=>'Good','strength'=>4,'notes'=>'Funds transfer via hawala.','firstSeen'=>'2020-06-01','lastSeen'=>'2026-02-28'],
            ['id'=>'c9','source'=>'p-3','target'=>'o-8','type'=>'Owner','relationship'=>'Good','strength'=>5,'notes'=>'Beneficial owner Meridian Finance.','firstSeen'=>'2019-01-01','lastSeen'=>'2026-03-18'],
            ['id'=>'c10','source'=>'p-4','target'=>'o-3','type'=>'Employee','relationship'=>'Neutral','strength'=>4,'notes'=>'Operations manager.','firstSeen'=>'2019-04-01','lastSeen'=>'2026-03-18'],
            ['id'=>'c11','source'=>'p-4','target'=>'p-1','type'=>'Business Associate','relationship'=>'Neutral','strength'=>3,'notes'=>'Logistics coordination.','firstSeen'=>'2021-01-15','lastSeen'=>'2026-03-10'],
            ['id'=>'c12','source'=>'p-5','target'=>'o-1','type'=>'Employee','relationship'=>'Good','strength'=>3,'notes'=>'Administrative assistant.','firstSeen'=>'2020-09-01','lastSeen'=>'2026-03-18'],
            ['id'=>'c13','source'=>'p-6','target'=>'o-3','type'=>'Contractor','relationship'=>'Neutral','strength'=>3,'notes'=>'Import/export specialist.','firstSeen'=>'2022-01-01','lastSeen'=>'2026-03-15'],
            ['id'=>'c14','source'=>'p-6','target'=>'o-6','type'=>'Business Associate','relationship'=>'Good','strength'=>3,'notes'=>'Shipping coordination.','firstSeen'=>'2021-06-01','lastSeen'=>'2026-03-12'],
            ['id'=>'c15','source'=>'p-7','target'=>'p-11','type'=>'Criminal Associate','relationship'=>'Good','strength'=>4,'notes'=>'Courier network.','firstSeen'=>'2021-08-01','lastSeen'=>'2026-02-28'],
            ['id'=>'c16','source'=>'p-8','target'=>'o-1','type'=>'Employee','relationship'=>'Neutral','strength'=>3,'notes'=>'Company accountant.','firstSeen'=>'2017-03-01','lastSeen'=>'2026-03-18'],
            ['id'=>'c17','source'=>'p-8','target'=>'o-8','type'=>'Contractor','relationship'=>'Neutral','strength'=>2,'notes'=>'External accounting.','firstSeen'=>'2020-01-01','lastSeen'=>'2026-03-15'],
            ['id'=>'c18','source'=>'p-9','target'=>'o-5','type'=>'Business Associate','relationship'=>'Bad','strength'=>4,'notes'=>'Transit route coordinator.','firstSeen'=>'2023-06-01','lastSeen'=>'2026-03-18'],
            ['id'=>'c19','source'=>'p-10','target'=>'o-4','type'=>'Owner','relationship'=>'Good','strength'=>5,'notes'=>'Founder.','firstSeen'=>'2016-01-01','lastSeen'=>'2026-03-18'],
            ['id'=>'c20','source'=>'p-10','target'=>'p-3','type'=>'Business Associate','relationship'=>'Good','strength'=>3,'notes'=>'Technology procurement.','firstSeen'=>'2022-01-15','lastSeen'=>'2026-02-20'],
            ['id'=>'c21','source'=>'o-1','target'=>'o-3','type'=>'Business Partner','relationship'=>'Neutral','strength'=>4,'notes'=>'Security contracts.','firstSeen'=>'2020-06-01','lastSeen'=>'2026-03-18'],
            ['id'=>'c22','source'=>'o-2','target'=>'o-8','type'=>'Financial','relationship'=>'Good','strength'=>5,'notes'=>'Investment fund → finance arm.','firstSeen'=>'2019-01-01','lastSeen'=>'2026-03-18'],
            ['id'=>'c23','source'=>'o-3','target'=>'o-5','type'=>'Business Partner','relationship'=>'Neutral','strength'=>3,'notes'=>'Logistics subcontracting.','firstSeen'=>'2022-03-01','lastSeen'=>'2026-03-15'],
            ['id'=>'c24','source'=>'o-4','target'=>'o-6','type'=>'Contractor','relationship'=>'Neutral','strength'=>2,'notes'=>'Shipping arrangement.','firstSeen'=>'2023-01-01','lastSeen'=>'2025-12-10'],
            ['id'=>'c25','source'=>'p-1','target'=>'p-3','type'=>'Financial','relationship'=>'Neutral','strength'=>3,'notes'=>'Investment connection via Rashid Holdings.','firstSeen'=>'2021-06-01','lastSeen'=>'2026-03-18'],
            ['id'=>'c26','source'=>'p-9','target'=>'p-12','type'=>'Criminal Associate','relationship'=>'Neutral','strength'=>3,'notes'=>'Suspected operational coordination.','firstSeen'=>'2024-01-01','lastSeen'=>'2026-03-18'],
            ['id'=>'c27','source'=>'p-11','target'=>'o-5','type'=>'Courier','relationship'=>'Bad','strength'=>3,'notes'=>'Package transit network.','firstSeen'=>'2023-09-01','lastSeen'=>'2026-02-28'],
            ['id'=>'c28','source'=>'o-7','target'=>'o-5','type'=>'Supplier','relationship'=>'Neutral','strength'=>2,'notes'=>'Chemical supply chain.','firstSeen'=>'2022-06-01','lastSeen'=>'2026-01-15'],
        ];
    }

    /** GET /mock-api/connections */
    public function index(Request $request): JsonResponse
    {
        $nodes = self::nodes();
        $edges = self::edges();
        $category = $request->query('category', '');
        $search = strtolower($request->query('search', ''));
        $entityId = $request->query('entity_id', '');

        if ($entityId) {
            $edges = array_values(array_filter($edges, fn($e) => $e['source'] === $entityId || $e['target'] === $entityId));
            $visIds = [];
            foreach ($edges as $e) { $visIds[] = $e['source']; $visIds[] = $e['target']; }
            $visIds = array_unique($visIds);
            $nodes = array_values(array_filter($nodes, fn($n) => in_array($n['id'], $visIds)));
        }
        if ($search) $nodes = array_values(array_filter($nodes, fn($n) => str_contains(strtolower($n['label'].' '.$n['subLabel']), $search)));

        return response()->json(['nodes' => $nodes, 'edges' => $edges, 'meta' => ['nodeCount' => count($nodes), 'edgeCount' => count($edges)]]);
    }

    /** GET /mock-api/connections/{id} */
    public function show(string $id): JsonResponse
    {
        $edge = collect(self::edges())->firstWhere('id', $id);
        if (!$edge) return response()->json(['message' => 'Connection not found.', 'code' => 'NOT_FOUND'], 404);
        $sourceNode = collect(self::nodes())->firstWhere('id', $edge['source']);
        $targetNode = collect(self::nodes())->firstWhere('id', $edge['target']);
        $edge['sourceNode'] = $sourceNode;
        $edge['targetNode'] = $targetNode;
        return response()->json(['data' => $edge]);
    }

    /** POST /mock-api/connections */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'entityA' => ['required', 'string'],
            'entityB' => ['required', 'string', 'different:entityA'],
            'type' => ['required', 'string'],
            'relationship' => ['required', 'in:Good,Bad,Neutral,Unknown'],
            'strength' => ['required', 'integer', 'min:1', 'max:5'],
        ]);
        $existing = collect(self::edges())->first(fn($e) =>
            ($e['source'] === $request->input('entityA') && $e['target'] === $request->input('entityB')) ||
            ($e['source'] === $request->input('entityB') && $e['target'] === $request->input('entityA'))
        );
        if ($existing) return response()->json(['message' => 'Connection already exists between these entities.', 'code' => 'DUPLICATE'], 409);
        Log::info('Connections API: created', ['a' => $request->input('entityA'), 'b' => $request->input('entityB')]);
        $now = now()->toDateString();
        return response()->json(['message' => 'Connection created.', 'data' => [
            'id' => 'c-' . Str::random(6), 'source' => $request->input('entityA'), 'target' => $request->input('entityB'),
            'type' => $request->input('type'), 'relationship' => $request->input('relationship'),
            'strength' => $request->input('strength'), 'notes' => $request->input('notes', ''),
            'firstSeen' => $now, 'lastSeen' => $now,
        ]], 201);
    }

    /** DELETE /mock-api/connections/{id} */
    public function destroy(string $id): JsonResponse
    {
        $edge = collect(self::edges())->firstWhere('id', $id);
        if (!$edge) return response()->json(['message' => 'Connection not found.', 'code' => 'NOT_FOUND'], 404);
        Log::info('Connections API: deleted', ['id' => $id]);
        return response()->json(['message' => 'Connection deleted.', 'id' => $id]);
    }

    /** GET /mock-api/connections/node/{nodeId} */
    public function nodeDetail(string $nodeId): JsonResponse
    {
        $node = collect(self::nodes())->firstWhere('id', $nodeId);
        if (!$node) return response()->json(['message' => 'Node not found.', 'code' => 'NOT_FOUND'], 404);
        $connected = array_values(array_filter(self::edges(), fn($e) => $e['source'] === $nodeId || $e['target'] === $nodeId));
        $connectedNodeIds = [];
        foreach ($connected as $e) { $connectedNodeIds[] = $e['source'] === $nodeId ? $e['target'] : $e['source']; }
        $connectedNodes = array_values(array_filter(self::nodes(), fn($n) => in_array($n['id'], $connectedNodeIds)));
        return response()->json(['node' => $node, 'connections' => $connected, 'connectedNodes' => $connectedNodes]);
    }

    /** GET /mock-api/connections/types */
    public function types(): JsonResponse
    {
        $typeUsage = [];
        foreach (self::edges() as $e) {
            $typeUsage[$e['type']] = ($typeUsage[$e['type']] ?? 0) + 1;
        }
        return response()->json(['data' => $typeUsage]);
    }
}
