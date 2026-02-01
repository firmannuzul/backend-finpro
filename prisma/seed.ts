// import { PrismaClient, Role, Gender, ApplicationStatus } from '@prisma/client'

// const prisma = new PrismaClient()

// async function main() {
//   console.log('🌱 Starting seeding...')

//   // 1. CLEANUP (Hapus data lama agar tidak duplikat/error)
//   // Urutan delete penting karena Foreign Key!
//   await prisma.interview.deleteMany()
//   await prisma.savedJob.deleteMany()
//   await prisma.preselectionQuestion.deleteMany()
//   await prisma.application.deleteMany()
//   await prisma.jobPosting.deleteMany()
//   await prisma.companyProfile.deleteMany()
//   await prisma.applicantProfile.deleteMany()
//   await prisma.user.deleteMany()

//   console.log('🧹 Database cleaned.')

//   // 2. CREATE USERS & PROFILES

//   // --- A. COMPANY USERS ---
//   const companyUser1 = await prisma.user.create({
//     data: {
//       email: 'hr@techindo.com',
//       password: 'password123', // Di real app, ini harus di-hash (bcrypt)
//       role: Role.COMPANY,
//       emailVerifiedAt: new Date(),
//       companyProfile: {
//         create: {
//           companyName: 'PT Tech Indo Sejahtera',
//           description: 'Perusahaan IT terkemuka di Jakarta Selatan.',
//           industry: 'Information Technology',
//           location: 'Jakarta Selatan',
//           websiteUrl: 'https://techindo.com',
//           logoPath: '/uploads/logo1.png'
//         }
//       }
//     },
//     include: { companyProfile: true } // Return profile agar kita dapat ID-nya
//   })

//   const companyUser2 = await prisma.user.create({
//     data: {
//       email: 'recruitment@startupy.com',
//       password: 'password123',
//       role: Role.COMPANY,
//       emailVerifiedAt: new Date(),
//       companyProfile: {
//         create: {
//           companyName: 'Startupy Unicorn',
//           description: 'Startup e-commerce yang sedang berkembang pesat.',
//           industry: 'E-Commerce',
//           location: 'Bandung',
//           websiteUrl: 'https://startupy.com'
//         }
//       }
//     },
//     include: { companyProfile: true }
//   })

//   // --- B. APPLICANT USERS ---
//   const applicantUser1 = await prisma.user.create({
//     data: {
//       email: 'budi_santoso@gmail.com',
//       password: 'password123',
//       role: Role.APPLICANT,
//       emailVerifiedAt: new Date(),
//       applicantProfile: {
//         create: {
//           name: 'Budi Santoso',
//           gender: Gender.L,
//           dob: new Date('1998-05-20'),
//           phone: '081234567890',
//           address: 'Jl. Merdeka No. 10, Jakarta Pusat',
//           lastEducation: 'S1 Teknik Informatika',
//           cvResumePath: '/uploads/cv_budi.pdf'
//         }
//       }
//     }
//   })

//   const applicantUser2 = await prisma.user.create({
//     data: {
//       email: 'siti_aminah@yahoo.com',
//       password: 'password123',
//       role: Role.APPLICANT,
//       emailVerifiedAt: new Date(),
//       applicantProfile: {
//         create: {
//           name: 'Siti Aminah',
//           gender: Gender.P,
//           dob: new Date('2000-10-15'),
//           phone: '089876543210',
//           address: 'Jl. Dago Pakar, Bandung',
//           lastEducation: 'D3 Desain Grafis'
//         }
//       }
//     }
//   })

//   // --- C. ADMIN USER ---
//   await prisma.user.create({
//     data: {
//       email: 'superadmin@jobportal.com',
//       password: 'password123',
//       role: Role.ADMIN,
//       emailVerifiedAt: new Date(),
//     }
//   })

//   console.log('✅ Users & Profiles created.')

//   // 3. CREATE JOB POSTINGS (Maksimal 3 Job)

//   // Job 1 oleh Company 1
//   const job1 = await prisma.jobPosting.create({
//     data: {
//       companyId: companyUser1.companyProfile!.id, // Menggunakan ID dari Company Profile
//       title: 'Senior Backend Engineer (Node.js)',
//       category: 'Software Engineering',
//       location: 'Jakarta Selatan (Hybrid)',
//       salaryMin: 15000000,
//       salaryMax: 25000000,
//       description: 'Mencari backend developer berpengalaman dengan Express & Prisma.',
//       hasPreselection: true,
//       postedAt: new Date(),
//       deadlineAt: new Date(new Date().setDate(new Date().getDate() + 30)), // Deadline 30 hari lagi
//     }
//   })

//   // Job 2 oleh Company 1
//   const job2 = await prisma.jobPosting.create({
//     data: {
//       companyId: companyUser1.companyProfile!.id,
//       title: 'UI/UX Designer',
//       category: 'Design',
//       location: 'Remote',
//       salaryMin: 8000000,
//       salaryMax: 12000000,
//       description: 'Dibutuhkan desainer kreatif untuk aplikasi mobile.',
//       hasPreselection: false,
//       deadlineAt: new Date(new Date().setDate(new Date().getDate() + 14)),
//     }
//   })

//   // Job 3 oleh Company 2
//   const job3 = await prisma.jobPosting.create({
//     data: {
//       companyId: companyUser2.companyProfile!.id,
//       title: 'Digital Marketing Specialist',
//       category: 'Marketing',
//       location: 'Bandung',
//       salaryMin: 6000000,
//       salaryMax: 9000000,
//       description: 'Mengelola ads dan social media campaign.',
//       hasPreselection: false,
//       deadlineAt: new Date(new Date().setDate(new Date().getDate() + 20)),
//     }
//   })

//   console.log('✅ Job Postings created.')

//   // 4. CREATE PRESELECTION QUESTIONS (Hanya untuk Job 1)

//   await prisma.preselectionQuestion.createMany({
//     data: [
//       {
//         jobPostingId: job1.id,
//         questionText: 'Apa command untuk inisialisasi Prisma?',
//         options: { a: 'npx prisma init', b: 'npm init prisma', c: 'prisma start', d: 'node prisma' }, // JSON
//         correctAnswer: 'a'
//       },
//       {
//         jobPostingId: job1.id,
//         questionText: 'Database apa yang default digunakan Prisma?',
//         options: { a: 'MongoDB', b: 'MySQL', c: 'PostgreSQL', d: 'SQLite' },
//         correctAnswer: 'c'
//       }
//     ]
//   })

//   console.log('✅ Questions created.')

//   // 5. CREATE APPLICATIONS & INTERVIEWS

//   // Skenario 1: Budi melamar Job 1 (Status: INTERVIEW)
//   const app1 = await prisma.application.create({
//     data: {
//       userId: applicantUser1.id,
//       jobPostingId: job1.id,
//       cvFilePath: '/uploads/cvs/budi_backend.pdf',
//       expectedSalary: 18000000,
//       preselectionScore: 100, // Lulus tes
//       status: ApplicationStatus.INTERVIEW,
//       interviews: {
//         create: {
//           scheduledAt: new Date(new Date().setDate(new Date().getDate() + 3)), // 3 hari lagi
//           locationLink: 'https://zoom.us/j/123456789',
//           notes: 'Harap siapkan laptop untuk live coding.',
//           isReminded: false
//         }
//       }
//     }
//   })

//   // Skenario 2: Siti melamar Job 2 (Status: PENDING)
//   await prisma.application.create({
//     data: {
//       userId: applicantUser2.id,
//       jobPostingId: job2.id,
//       cvFilePath: '/uploads/cvs/siti_design.pdf',
//       expectedSalary: 9000000,
//       status: ApplicationStatus.PENDING
//     }
//   })

//   // Skenario 3: Budi melamar Job 3 (Status: REJECTED)
//   await prisma.application.create({
//     data: {
//       userId: applicantUser1.id,
//       jobPostingId: job3.id,
//       cvFilePath: '/uploads/cvs/budi_general.pdf',
//       expectedSalary: 10000000,
//       status: ApplicationStatus.REJECTED,
//       rejectionReason: 'Maaf, kualifikasi belum sesuai dengan kebutuhan marketing kami.'
//     }
//   })

//   console.log('✅ Applications & Interviews created.')
//   console.log('🌱 Seeding finished.')
// }

// main()
//   .catch((e) => {
//     console.error(e)
//     process.exit(1)
//   })
//   .finally(async () => {
//     await prisma.$disconnect()
//   })
