export type ArchiveType = 'BUKU_TANAH' | 'WARKAH' | 'SURAT_UKUR';
export type LoanStatus = 'Active' | 'Returned';
export type ArchiveStatus = 'Available' | 'Borrowed';
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'PETUGAS_ARSIP';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface Archive {
  id: string;
  type: ArchiveType;
  
  // common
  namaPemegangHak: string;
  kecamatan: string;
  kelurahan: string;
  rak: string;
  shaft: string;
  boks?: string;
  bundel?: string;
  keterangan?: string;
  status: ArchiveStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;

  // Buku Tanah specific
  noHak?: string;
  jenisHak?: string;
  noSU?: string;
  tahunSU?: number;
  noSK?: string;
  hasBukuTanah?: boolean;
  hasSuratUkur?: boolean;

  // Warkah specific
  noDI208?: string;
  jenisWarkah?: string;
  jenisKegiatan?: string;
  tahun?: number;
}

export interface Loan {
  id: string;
  archiveId: string;
  borrowerName: string;
  loanDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: LoanStatus;
  notes?: string;
}
