<?php

namespace App\Http\Controllers\MockApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * ARGUX Admin Role Management Mock REST API.
 * CRUD for roles with per-module permission matrix + duplicate.
 */
class AdminRolesApiController extends Controller
{
    private static function allActions(): array { return ['view','create','edit','delete','export','manage']; }
    private static function viewOnly(): array { return ['view']; }
    private static function viewExport(): array { return ['view','export']; }
    private static function viewCreateEdit(): array { return ['view','create','edit']; }
    private static function fullExceptManage(): array { return ['view','create','edit','delete','export']; }

    private static function moduleIds(): array
    {
        return ['map','vision','operations','persons','organizations','vehicles','devices',
            'plate_recognition','face_recognition','scraper','web_scraper','surveillance_apps',
            'connections','workflows','data_sources','alerts','activity','notifications','risks',
            'ai_assistant','records','storage','reports','jobs',
            'admin_dashboard','admin_users','admin_admins','admin_roles','admin_config','admin_audit','admin_support','admin_kb'];
    }

    private static function adminModuleIds(): array
    {
        return array_filter(self::moduleIds(), fn($m) => str_starts_with($m, 'admin_'));
    }

    private static function allModulePerms(array $actions): array
    {
        return array_map(fn($m) => ['moduleId' => $m, 'actions' => $actions], self::moduleIds());
    }

    private static function roles(): array
    {
        $all = self::allActions(); $vo = self::viewOnly(); $ve = self::viewExport();
        $vce = self::viewCreateEdit(); $fem = self::fullExceptManage();
        $mids = self::moduleIds(); $adminMids = self::adminModuleIds();

        return [
            ['id'=>1,'name'=>'Super Admin','scope'=>'admin','color'=>'#ef4444','description'=>'Unrestricted access to all system modules.','level'=>10,'isSystem'=>true,'permissions'=>self::allModulePerms($all),'userCount'=>2,'createdAt'=>'2024-01-15','createdBy'=>'System'],
            ['id'=>2,'name'=>'Admin','scope'=>'admin','color'=>'#f97316','description'=>'Full operator and admin panel access except admin accounts.','level'=>8,'isSystem'=>true,'permissions'=>array_map(fn($m)=>['moduleId'=>$m,'actions'=>$m==='admin_admins'?$vo:$all],$mids),'userCount'=>4,'createdAt'=>'2024-01-15','createdBy'=>'System'],
            ['id'=>3,'name'=>'Security Officer','scope'=>'admin','color'=>'#8b5cf6','description'=>'Audit logs, security config, session and alert management.','level'=>6,'isSystem'=>true,'permissions'=>array_map(fn($m)=>['moduleId'=>$m,'actions'=>in_array($m,['admin_audit','admin_config','alerts','activity','risks'])?$all:(in_array($m,$adminMids)?$vo:$ve)],$mids),'userCount'=>2,'createdAt'=>'2024-01-15','createdBy'=>'System'],
            ['id'=>4,'name'=>'Audit Reader','scope'=>'admin','color'=>'#3b82f6','description'=>'Read-only access to audit logs and reports.','level'=>3,'isSystem'=>true,'permissions'=>array_map(fn($m)=>['moduleId'=>$m,'actions'=>in_array($m,['admin_audit','admin_dashboard','reports'])?$ve:[]],$mids),'userCount'=>2,'createdAt'=>'2024-01-15','createdBy'=>'System'],
            ['id'=>5,'name'=>'Support Agent','scope'=>'admin','color'=>'#06b6d4','description'=>'Support tickets and knowledge base management.','level'=>2,'isSystem'=>true,'permissions'=>array_map(fn($m)=>['moduleId'=>$m,'actions'=>in_array($m,['admin_support','admin_kb'])?$fem:($m==='admin_dashboard'?$vo:[])],$mids),'userCount'=>2,'createdAt'=>'2024-01-15','createdBy'=>'System'],
            ['id'=>10,'name'=>'Senior Operator','scope'=>'user','color'=>'#22c55e','description'=>'Full access to all operational modules.','level'=>7,'isSystem'=>true,'permissions'=>array_values(array_map(fn($m)=>['moduleId'=>$m,'actions'=>$all],array_filter($mids,fn($m)=>!in_array($m,$adminMids)))),'userCount'=>4,'createdAt'=>'2024-01-15','createdBy'=>'System'],
            ['id'=>11,'name'=>'Intelligence Analyst','scope'=>'user','color'=>'#8b5cf6','description'=>'Intelligence modules, connections, AI, and reporting.','level'=>5,'isSystem'=>false,'permissions'=>array_values(array_map(fn($m)=>['moduleId'=>$m,'actions'=>in_array($m,['persons','organizations','connections','face_recognition','scraper','web_scraper','ai_assistant','reports','records'])?$fem:$ve],array_filter($mids,fn($m)=>!in_array($m,$adminMids)))),'userCount'=>4,'createdAt'=>'2024-03-20','createdBy'=>'Col. Tomić'],
            ['id'=>12,'name'=>'Operator','scope'=>'user','color'=>'#f59e0b','description'=>'Standard operator. View and create, limited editing.','level'=>4,'isSystem'=>true,'permissions'=>array_values(array_map(fn($m)=>['moduleId'=>$m,'actions'=>in_array($m,['map','vision','activity','notifications','alerts','storage'])?$vce:$vo],array_filter($mids,fn($m)=>!in_array($m,$adminMids)))),'userCount'=>5,'createdAt'=>'2024-01-15','createdBy'=>'System'],
            ['id'=>13,'name'=>'Viewer','scope'=>'user','color'=>'#6b7280','description'=>'Read-only for briefing and oversight.','level'=>2,'isSystem'=>true,'permissions'=>array_values(array_map(fn($m)=>['moduleId'=>$m,'actions'=>in_array($m,['map','persons','organizations','vehicles','activity','reports'])?$vo:[]],array_filter($mids,fn($m)=>!in_array($m,$adminMids)))),'userCount'=>1,'createdAt'=>'2024-01-15','createdBy'=>'System'],
            ['id'=>14,'name'=>'Trainee','scope'=>'user','color'=>'#ec4899','description'=>'Limited training access. Map, vision, activity only.','level'=>1,'isSystem'=>false,'permissions'=>array_values(array_map(fn($m)=>['moduleId'=>$m,'actions'=>in_array($m,['map','vision','activity','notifications'])?$vo:[]],array_filter($mids,fn($m)=>!in_array($m,$adminMids)))),'userCount'=>1,'createdAt'=>'2026-01-15','createdBy'=>'Maj. Novak'],
        ];
    }

    /** GET /mock-api/admin/roles */
    public function index(Request $request): JsonResponse
    {
        $data = self::roles();
        $search = strtolower($request->query('search', ''));
        $scope = $request->query('scope', '');
        if ($scope) $data = array_values(array_filter($data, fn($r) => $r['scope'] === $scope));
        if ($search) $data = array_values(array_filter($data, fn($r) => str_contains(strtolower($r['name'].' '.$r['description']), $search)));
        usort($data, fn($a, $b) => $b['level'] - $a['level']);
        return response()->json([
            'data' => $data,
            'meta' => ['total' => count($data)],
            'counts' => ['admin' => count(array_filter(self::roles(), fn($r) => $r['scope'] === 'admin')), 'user' => count(array_filter(self::roles(), fn($r) => $r['scope'] === 'user'))],
        ]);
    }

    /** GET /mock-api/admin/roles/{id} */
    public function show(Request $request, int $id): JsonResponse
    {
        $role = collect(self::roles())->firstWhere('id', $id);
        if (!$role) return response()->json(['message' => 'Role not found.', 'code' => 'NOT_FOUND'], 404);
        return response()->json(['data' => $role]);
    }

    /** POST /mock-api/admin/roles */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required','string','min:2','max:100'],
            'scope' => ['required','in:admin,user'],
            'color' => ['required','string','max:20'],
            'description' => ['nullable','string','max:500'],
            'level' => ['required','integer','min:1','max:10'],
            'permissions' => ['nullable','array'],
            'permissions.*.moduleId' => ['required_with:permissions','string'],
            'permissions.*.actions' => ['required_with:permissions','array'],
        ]);
        if (collect(self::roles())->firstWhere('name', $request->input('name'))) {
            return response()->json(['message' => 'Role name already exists.', 'errors' => ['name' => ['A role with this name already exists.']], 'code' => 'NAME_TAKEN'], 422);
        }
        Log::info('Admin Roles API: role created', ['name' => $request->input('name')]);
        usleep(400_000);
        return response()->json(['message' => 'Role created.', 'data' => [
            'id' => time(), 'name' => $request->input('name'), 'scope' => $request->input('scope'),
            'color' => $request->input('color'), 'description' => $request->input('description', ''),
            'level' => $request->integer('level'), 'isSystem' => false,
            'permissions' => $request->input('permissions', []),
            'userCount' => 0, 'createdAt' => now()->toDateString(), 'createdBy' => 'System Administrator',
        ]], 201);
    }

    /** PUT /mock-api/admin/roles/{id} */
    public function update(Request $request, int $id): JsonResponse
    {
        $role = collect(self::roles())->firstWhere('id', $id);
        if (!$role) return response()->json(['message' => 'Role not found.', 'code' => 'NOT_FOUND'], 404);
        $request->validate([
            'name' => ['sometimes','string','min:2','max:100'],
            'scope' => ['sometimes','in:admin,user'],
            'color' => ['sometimes','string','max:20'],
            'description' => ['nullable','string','max:500'],
            'level' => ['sometimes','integer','min:1','max:10'],
            'permissions' => ['nullable','array'],
        ]);
        Log::info('Admin Roles API: role updated', ['id' => $id]);
        usleep(400_000);
        $updated = array_merge($role, array_filter([
            'name' => $request->input('name'), 'scope' => $request->input('scope'),
            'color' => $request->input('color'), 'description' => $request->input('description'),
            'level' => $request->input('level'),
        ], fn($v) => $v !== null));
        if ($request->has('permissions')) $updated['permissions'] = $request->input('permissions');
        return response()->json(['message' => 'Role updated.', 'data' => $updated]);
    }

    /** DELETE /mock-api/admin/roles/{id} */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $role = collect(self::roles())->firstWhere('id', $id);
        if (!$role) return response()->json(['message' => 'Role not found.', 'code' => 'NOT_FOUND'], 404);
        if ($role['isSystem']) {
            return response()->json(['message' => 'System roles cannot be deleted.', 'code' => 'SYSTEM_ROLE'], 403);
        }
        if ($role['userCount'] > 0) {
            return response()->json(['message' => "Cannot delete role assigned to {$role['userCount']} user(s). Reassign first.", 'code' => 'HAS_USERS'], 409);
        }
        Log::info('Admin Roles API: role deleted', ['id' => $id, 'name' => $role['name']]);
        return response()->json(['message' => "Role \"{$role['name']}\" deleted.", 'id' => $id]);
    }

    /** POST /mock-api/admin/roles/{id}/duplicate */
    public function duplicate(Request $request, int $id): JsonResponse
    {
        $role = collect(self::roles())->firstWhere('id', $id);
        if (!$role) return response()->json(['message' => 'Role not found.', 'code' => 'NOT_FOUND'], 404);
        Log::info('Admin Roles API: role duplicated', ['source_id' => $id, 'name' => $role['name']]);
        usleep(300_000);
        $dup = $role;
        $dup['id'] = time();
        $dup['name'] = $role['name'] . ' (Copy)';
        $dup['isSystem'] = false;
        $dup['userCount'] = 0;
        $dup['createdAt'] = now()->toDateString();
        $dup['createdBy'] = 'System Administrator';
        return response()->json(['message' => "Role duplicated as \"{$dup['name']}\".", 'data' => $dup], 201);
    }
}
