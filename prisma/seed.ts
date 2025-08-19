import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

const knowledgeEntries = [
  {
    id: '1',
    question: 'What is the full name of Sarhad College?',
    answer: 'The full name is Sarhad College of Arts, Commerce & Science, located in Katraj, Pune.',
    tags: ['general', 'name', 'college'],
    author: 'system',
    createdAt: new Date('2025-08-19T12:00:00Z'),
  },
  {
    id: '2',
    question: 'When was Sarhad College established?',
    answer: 'Sarhad College of Arts, Commerce & Science was established in 2008.',
    tags: ['history', 'establishment'],
    author: 'system',
    createdAt: new Date('2025-08-19T12:00:00Z'),
  },
  {
    id: '3',
    question: 'Which university is Sarhad College affiliated with?',
    answer: 'The college is affiliated with Savitribai Phule Pune University (SPPU).',
    tags: ['affiliation', 'university'],
    author: 'system',
    createdAt: new Date('2025-08-19T12:00:00Z'),
  },
  {
    id: '4',
    question: 'What accreditation does Sarhad College hold?',
    answer: 'Sarhad College is approved by UGC and accredited by NAAC with a B+ grade.',
    tags: ['accreditation', 'naac'],
    author: 'system',
    createdAt: new Date('2025-08-19T12:00:00Z'),
  },
  {
    id: '5',
    question: 'What undergraduate courses are offered?',
    answer: 'The college offers BA, B.Com, B.Sc (Computer Science, Physics, Chemistry), BBA, and BCA.',
    tags: ['courses', 'undergraduate'],
    author: 'system',
    createdAt: new Date('2025-08-19T12:00:00Z'),
  },
  {
    id: '6',
    question: 'What postgraduate courses are offered?',
    answer: 'The college offers MA, M.Com, M.Sc (Computer Science, Physics), and MCA.',
    tags: ['courses', 'postgraduate'],
    author: 'system',
    createdAt: new Date('2025-08-19T12:00:00Z'),
  },
  {
    id: '7',
    question: 'What is the admission process?',
    answer: 'Admissions are merit-based or first-come-first-serve. Applications can be submitted online or offline with documents like 10th/12th marksheet, transfer certificate, ID proof, and passport-size photos.',
    tags: ['admissions', 'eligibility'],
    author: 'system',
    createdAt: new Date('2025-08-19T12:00:00Z'),
  },
  {
    id: '8',
    question: 'What facilities are available on campus?',
    answer: 'Facilities include a library, computer labs, smart classrooms, auditorium, conference halls, sports ground, gymnasium, cafeteria, and Wi-Fi enabled campus.',
    tags: ['facilities', 'campus'],
    author: 'system',
    createdAt: new Date('2025-08-19T12:00:00Z'),
  },
  {
    id: '9',
    question: 'What are the placement highlights?',
    answer: 'Sarhad College has an 80% placement rate. The highest package is ₹17 LPA (2024), and the average package is ₹7.5 LPA (2025). Top recruiters include TCS, Infosys, Tech Mahindra, Accenture, and Ellisys.',
    tags: ['placements', 'recruiters'],
    author: 'system',
    createdAt: new Date('2025-08-19T12:00:00Z'),
  },
  {
    id: '10',
    question: 'Where is Sarhad College located?',
    answer: 'Sarhad College is located at Sr. No. 79, 80, 81, 76/4 (New), Near Rajaram Gas Agency, Pune–Kashmir Maitri Chowk, Katraj, Pune – 411046.',
    tags: ['location', 'address'],
    author: 'system',
    createdAt: new Date('2025-08-19T12:00:00Z'),
  },
];

async function main() {
  for (const entry of knowledgeEntries) {
    await prisma.knowledgeEntry.upsert({
      where: { id: entry.id },
      update: entry,
      create: entry,
    });
  }
  console.log('Seeded knowledge base!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
