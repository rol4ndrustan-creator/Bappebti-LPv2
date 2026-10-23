"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SearchableSelect } from "@/components/shared/searchable-select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ECOSYSTEM_ENTITIES, EKOSISTEM_ACTIVE_MEMBERS, EKOSISTEM_PENGAWAS_MEMBERS } from "@/lib/mock-data";
import {
  useEcosystemActiveMembers,
  addActiveMember,
  updateActiveMember,
  deleteActiveMember,
  useEcosystemPengawasMembers,
  addPengawasMember,
  updatePengawasMember,
  deletePengawasMember,
} from "@/lib/mock-service/ecosystem-member-store";
import {
  EcosystemActiveMember,
  EcosystemActiveMemberStatus,
  EcosystemActiveMemberType,
  EcosystemAssociation,
  EcosystemPengawasMember,
  EcosystemPengawasMembershipStatus,
  PelakuUsahaCategory,
} from "@/lib/types";
import { useDemoSession } from "@/lib/demo-session";
import { useToast } from "@/components/shared/toast-provider";
import { formatDateID } from "@/lib/format";
import { Plus, Pencil, Trash2 } from "lucide-react";

const ACTIVE_TYPE_BY_CATEGORY: Record<string, EcosystemActiveMemberType> = { Bursa: "Bursa", Kliring: "Kliring", Custody: "Custody" };
const ACTIVE_STATUSES: EcosystemActiveMemberStatus[] = ["Aktif", "Non-Aktif"];
const PENGAWAS_STATUSES: EcosystemPengawasMembershipStatus[] = ["Aktif", "Suspended", "Non-Aktif"];
const PELAKU_USAHA_CATEGORIES: PelakuUsahaCategory[] = ["Pialang Berjangka", "CPFAK / PFAK", "Platform"];
const ASSOCIATIONS: EcosystemAssociation[] = ["ASPEBTINDO", "BAKTI"];

const PENGAWAS_STATUS_VARIANT: Record<EcosystemPengawasMembershipStatus, "green" | "amber" | "muted"> = {
  Aktif: "green",
  Suspended: "amber",
  "Non-Aktif": "muted",
};

interface ActiveFormState {
  sourceEntityId: string;
  name: string;
  memberType: EcosystemActiveMemberType;
  license: string;
  id: string;
  registeredAt: string;
  picName: string;
  picEmail: string;
  status: EcosystemActiveMemberStatus;
}

interface PengawasFormState {
  association: EcosystemAssociation;
  sourceEntityId: string;
  companyName: string;
  category: PelakuUsahaCategory;
  license: string;
  id: string;
  joinedAt: string;
  picName: string;
  picContact: string;
  status: EcosystemPengawasMembershipStatus;
}

export default function ManagementMemberPage() {
  const { user } = useDemoSession();
  const { showToast } = useToast();
  const [tab, setTab] = useState("active");

  const activeMembers = useEcosystemActiveMembers(EKOSISTEM_ACTIVE_MEMBERS);
  const pengawasMembers = useEcosystemPengawasMembers(EKOSISTEM_PENGAWAS_MEMBERS);

  const activeCandidates = useMemo(
    () => ECOSYSTEM_ENTITIES.filter((e) => e.ecosystemType === "Ecosystem Aktif" && e.category !== "Platform/Pialang"),
    []
  );
  const pelakuUsahaCandidates = useMemo(() => ECOSYSTEM_ENTITIES.filter((e) => e.category === "Platform/Pialang"), []);

  // --- Tab A: Member Ekosistem Active ---
  const [activeDialog, setActiveDialog] = useState<"add" | EcosystemActiveMember | null>(null);
  const [activeForm, setActiveForm] = useState<ActiveFormState>({
    sourceEntityId: "",
    name: "",
    memberType: "Bursa",
    license: "",
    id: "",
    registeredAt: "",
    picName: "",
    picEmail: "",
    status: "Aktif",
  });

  function openAddActive() {
    setActiveForm({
      sourceEntityId: "",
      name: "",
      memberType: "Bursa",
      license: "",
      id: "",
      registeredAt: formatDateID(new Date()),
      picName: "",
      picEmail: "",
      status: "Aktif",
    });
    setActiveDialog("add");
  }

  function openEditActive(m: EcosystemActiveMember) {
    setActiveForm({
      sourceEntityId: m.sourceEntityId,
      name: m.name,
      memberType: m.memberType,
      license: m.license,
      id: m.id,
      registeredAt: m.registeredAt,
      picName: m.picName,
      picEmail: m.picEmail,
      status: m.status,
    });
    setActiveDialog(m);
  }

  function selectActiveEntity(name: string) {
    const entity = activeCandidates.find((e) => e.name === name);
    if (!entity) return;
    setActiveForm((f) => ({
      ...f,
      sourceEntityId: entity.id,
      name: entity.name,
      memberType: ACTIVE_TYPE_BY_CATEGORY[entity.category] ?? "Bursa",
      license: entity.license ?? "",
    }));
  }

  function submitActive() {
    if (!activeForm.id.trim() || !activeForm.name.trim()) return;
    const record: EcosystemActiveMember = {
      id: activeForm.id.trim(),
      sourceEntityId: activeForm.sourceEntityId,
      name: activeForm.name,
      memberType: activeForm.memberType,
      license: activeForm.license,
      registeredAt: activeForm.registeredAt,
      picName: activeForm.picName,
      picEmail: activeForm.picEmail,
      status: activeForm.status,
      createdBy: user.name,
      createdAt: formatDateID(new Date()),
    };
    if (activeDialog === "add") {
      addActiveMember(record);
      showToast("Member Ekosistem Active berhasil ditambahkan.");
    } else if (activeDialog) {
      updateActiveMember(activeDialog.id, record);
      showToast("Profil member berhasil diperbarui.");
    }
    setActiveDialog(null);
  }

  // --- Tab B: Member Ekosistem Pengawas ---
  const [pengawasDialog, setPengawasDialog] = useState<"add" | EcosystemPengawasMember | null>(null);
  const [pengawasForm, setPengawasForm] = useState<PengawasFormState>({
    association: "ASPEBTINDO",
    sourceEntityId: "",
    companyName: "",
    category: "Pialang Berjangka",
    license: "",
    id: "",
    joinedAt: "",
    picName: "",
    picContact: "",
    status: "Aktif",
  });

  function openAddPengawas() {
    setPengawasForm({
      association: "ASPEBTINDO",
      sourceEntityId: "",
      companyName: "",
      category: "Pialang Berjangka",
      license: "",
      id: "",
      joinedAt: formatDateID(new Date()),
      picName: "",
      picContact: "",
      status: "Aktif",
    });
    setPengawasDialog("add");
  }

  function openEditPengawas(m: EcosystemPengawasMember) {
    setPengawasForm({
      association: m.association,
      sourceEntityId: m.sourceEntityId,
      companyName: m.companyName,
      category: m.category,
      license: m.license,
      id: m.id,
      joinedAt: m.joinedAt,
      picName: m.picName,
      picContact: m.picContact,
      status: m.status,
    });
    setPengawasDialog(m);
  }

  function selectPelakuUsaha(name: string) {
    const entity = pelakuUsahaCandidates.find((e) => e.name === name);
    if (!entity) return;
    const inferredCategory: PelakuUsahaCategory = entity.bursa === "Bursa Aset Kripto Indonesia" ? "CPFAK / PFAK" : "Pialang Berjangka";
    setPengawasForm((f) => ({
      ...f,
      sourceEntityId: entity.id,
      companyName: entity.name,
      category: inferredCategory,
      license: entity.license ?? "",
    }));
  }

  function submitPengawas() {
    if (!pengawasForm.id.trim() || !pengawasForm.companyName.trim()) return;
    const record: EcosystemPengawasMember = {
      id: pengawasForm.id.trim(),
      sourceEntityId: pengawasForm.sourceEntityId,
      association: pengawasForm.association,
      companyName: pengawasForm.companyName,
      category: pengawasForm.category,
      license: pengawasForm.license,
      joinedAt: pengawasForm.joinedAt,
      picName: pengawasForm.picName,
      picContact: pengawasForm.picContact,
      status: pengawasForm.status,
      createdBy: user.name,
      createdAt: formatDateID(new Date()),
    };
    if (pengawasDialog === "add") {
      addPengawasMember(record);
      showToast("Member Ekosistem Pengawas berhasil ditambahkan.");
    } else if (pengawasDialog) {
      updatePengawasMember(pengawasDialog.id, record);
      showToast("Profil member berhasil diperbarui.");
    }
    setPengawasDialog(null);
  }

  return (
    <div>
      <PageHeader
        title="Management Member"
        description="Pengelolaan data keanggotaan Ekosistem Active dan Ekosistem Pengawas secara terpusat oleh Bappebti."
        actions={
          <Button size="sm" onClick={tab === "active" ? openAddActive : openAddPengawas}>
            <Plus className="size-3.5" /> Tambah Member
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="active">Member Ekosistem Active</TabsTrigger>
          <TabsTrigger value="pengawas">Member Ekosistem Pengawas</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode Entitas</TableHead>
                <TableHead>Nama Lembaga</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>No. Izin/SK</TableHead>
                <TableHead>Terdaftar</TableHead>
                <TableHead>PIC Operasional</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeMembers.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium text-navy whitespace-nowrap">{m.id}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{m.name}</TableCell>
                  <TableCell className="text-muted whitespace-nowrap">{m.memberType}</TableCell>
                  <TableCell className="text-muted whitespace-nowrap">{m.license}</TableCell>
                  <TableCell className="text-muted whitespace-nowrap">{m.registeredAt}</TableCell>
                  <TableCell className="text-muted max-w-[180px] truncate">{m.picName}</TableCell>
                  <TableCell>
                    <Badge variant={m.status === "Aktif" ? "green" : "muted"}>{m.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button title="Ubah Profil" onClick={() => openEditActive(m)} className="rounded p-1 text-muted hover:bg-muted-bg hover:text-navy">
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        title="Hapus Keanggotaan"
                        onClick={() => {
                          deleteActiveMember(m.id);
                          showToast("Keanggotaan dihapus.");
                        }}
                        className="rounded p-1 text-muted hover:bg-red-bg hover:text-red"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {activeMembers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted py-6">
                    Belum ada member Ekosistem Active.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="pengawas">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode Anggota</TableHead>
                <TableHead>Nama Perusahaan</TableHead>
                <TableHead>Lembaga</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>No. Izin</TableHead>
                <TableHead>Bergabung</TableHead>
                <TableHead>PIC Compliance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pengawasMembers.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium text-navy whitespace-nowrap">{m.id}</TableCell>
                  <TableCell className="max-w-[180px] truncate">{m.companyName}</TableCell>
                  <TableCell className="text-muted whitespace-nowrap">{m.association}</TableCell>
                  <TableCell className="text-muted whitespace-nowrap">{m.category}</TableCell>
                  <TableCell className="text-muted whitespace-nowrap">{m.license}</TableCell>
                  <TableCell className="text-muted whitespace-nowrap">{m.joinedAt}</TableCell>
                  <TableCell className="text-muted max-w-[160px] truncate">{m.picName}</TableCell>
                  <TableCell>
                    <Badge variant={PENGAWAS_STATUS_VARIANT[m.status]}>{m.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button title="Ubah Profil" onClick={() => openEditPengawas(m)} className="rounded p-1 text-muted hover:bg-muted-bg hover:text-navy">
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        title="Hapus Keanggotaan"
                        onClick={() => {
                          deletePengawasMember(m.id);
                          showToast("Keanggotaan dihapus.");
                        }}
                        className="rounded p-1 text-muted hover:bg-red-bg hover:text-red"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {pengawasMembers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted py-6">
                    Belum ada member Ekosistem Pengawas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      {/* Tambah/Ubah Member — Ekosistem Active */}
      <Dialog open={!!activeDialog} onOpenChange={(v) => !v && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{activeDialog === "add" ? "Tambah Member Ekosistem Active" : "Ubah Profil Member"}</DialogTitle>
            <DialogDescription>Infrastruktur pasar — Bursa, Kliring, atau Custody.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Entitas (dari Manajemen Ekosistem)</Label>
              <SearchableSelect
                value={activeForm.name}
                onChange={selectActiveEntity}
                groups={[{ label: "Bursa / Kliring / Custody", options: activeCandidates.map((e) => e.name) }]}
                placeholder="Pilih entitas..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="active-type">Tipe Ekosistem</Label>
                <Input id="active-type" value={activeForm.memberType} disabled />
              </div>
              <div>
                <Label htmlFor="active-license">No. SK/Izin Bappebti</Label>
                <Input id="active-license" value={activeForm.license} disabled />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="active-id">Kode Entitas Internal</Label>
                <Input id="active-id" value={activeForm.id} onChange={(e) => setActiveForm((f) => ({ ...f, id: e.target.value }))} placeholder="mis. KBI-001" />
              </div>
              <div>
                <Label htmlFor="active-registered">Tanggal Terdaftar</Label>
                <Input id="active-registered" value={activeForm.registeredAt} onChange={(e) => setActiveForm((f) => ({ ...f, registeredAt: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="active-pic-name">PIC Operasional</Label>
                <Input id="active-pic-name" value={activeForm.picName} onChange={(e) => setActiveForm((f) => ({ ...f, picName: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="active-pic-email">Email PIC</Label>
                <Input id="active-pic-email" type="email" value={activeForm.picEmail} onChange={(e) => setActiveForm((f) => ({ ...f, picEmail: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label htmlFor="active-status">Status</Label>
              <Select
                id="active-status"
                value={activeForm.status}
                onChange={(e) => setActiveForm((f) => ({ ...f, status: e.target.value as EcosystemActiveMemberStatus }))}
              >
                {ACTIVE_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" variant="secondary" onClick={() => setActiveDialog(null)}>Batal</Button>
            <Button size="sm" disabled={!activeForm.id.trim() || !activeForm.name.trim()} onClick={submitActive}>
              {activeDialog === "add" ? "Tambah Member" : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tambah/Ubah Member — Ekosistem Pengawas */}
      <Dialog open={!!pengawasDialog} onOpenChange={(v) => !v && setPengawasDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pengawasDialog === "add" ? "Tambah Member Ekosistem Pengawas" : "Ubah Profil Member"}</DialogTitle>
            <DialogDescription>Pelaku usaha di bawah asosiasi pengawas (ASPEBTINDO / BAKTI).</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="pengawas-lembaga">Lembaga Penampung</Label>
              <Select
                id="pengawas-lembaga"
                value={pengawasForm.association}
                onChange={(e) => setPengawasForm((f) => ({ ...f, association: e.target.value as EcosystemAssociation }))}
              >
                {ASSOCIATIONS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Pelaku Usaha (dari Platform Management)</Label>
              <SearchableSelect
                value={pengawasForm.companyName}
                onChange={selectPelakuUsaha}
                groups={[{ label: "Pialang Berjangka / Pedagang", options: pelakuUsahaCandidates.map((e) => e.name) }]}
                placeholder="Pilih pelaku usaha..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pengawas-category">Kategori Pelaku Usaha</Label>
                <Select
                  id="pengawas-category"
                  value={pengawasForm.category}
                  onChange={(e) => setPengawasForm((f) => ({ ...f, category: e.target.value as PelakuUsahaCategory }))}
                >
                  {PELAKU_USAHA_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="pengawas-license">No. Izin Bappebti</Label>
                <Input id="pengawas-license" value={pengawasForm.license} disabled />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pengawas-id">Kode Anggota Asosiasi</Label>
                <Input id="pengawas-id" value={pengawasForm.id} onChange={(e) => setPengawasForm((f) => ({ ...f, id: e.target.value }))} placeholder="mis. ASP-PL-048" />
              </div>
              <div>
                <Label htmlFor="pengawas-joined">Tanggal Terdaftar</Label>
                <Input id="pengawas-joined" value={pengawasForm.joinedAt} onChange={(e) => setPengawasForm((f) => ({ ...f, joinedAt: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pengawas-pic-name">PIC Compliance</Label>
                <Input id="pengawas-pic-name" value={pengawasForm.picName} onChange={(e) => setPengawasForm((f) => ({ ...f, picName: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="pengawas-pic-contact">Kontak Aduan (email/telepon)</Label>
                <Input id="pengawas-pic-contact" value={pengawasForm.picContact} onChange={(e) => setPengawasForm((f) => ({ ...f, picContact: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label htmlFor="pengawas-status">Status Keanggotaan</Label>
              <Select
                id="pengawas-status"
                value={pengawasForm.status}
                onChange={(e) => setPengawasForm((f) => ({ ...f, status: e.target.value as EcosystemPengawasMembershipStatus }))}
              >
                {PENGAWAS_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" variant="secondary" onClick={() => setPengawasDialog(null)}>Batal</Button>
            <Button size="sm" disabled={!pengawasForm.id.trim() || !pengawasForm.companyName.trim()} onClick={submitPengawas}>
              {pengawasDialog === "add" ? "Tambah Member" : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
