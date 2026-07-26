/**
 * Database Seeder
 * -----------------
 * Populates the database with sample NCERT book records
 * for Class 9 and Class 10, and creates a default admin account.
 *
 * Usage: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Book = require('./models/Book');
const Admin = require('./models/Admin');

// Sample NCERT books data
const sampleBooks = [
  // ── Class 9 ─────────────────────────────
  {
    title: 'Mathematics – Class 9',
    class: 9,
    subject: 'Mathematics',
    language: 'English',
    description: 'NCERT Mathematics textbook for Class 9 covering number systems, polynomials, coordinate geometry, linear equations, triangles, quadrilaterals, circles, constructions, surface areas, volumes, statistics, and probability.',
    coverImage: '/images/covers/class9-maths.png',
    pdfPath: ''
  },
  {
    title: 'Science – Class 9',
    class: 9,
    subject: 'Science',
    language: 'English',
    description: 'NCERT Science textbook for Class 9 covering matter, atoms, molecules, cell biology, tissues, motion, force, gravitation, work, energy, sound, and natural resources.',
    coverImage: '/images/covers/class9-science.png',
    pdfPath: ''
  },
  {
    title: 'English – Beehive (Class 9)',
    class: 9,
    subject: 'English',
    language: 'English',
    description: 'NCERT English textbook "Beehive" for Class 9. Includes prose and poetry selections to develop language skills, reading comprehension, and literary appreciation.',
    coverImage: '/images/covers/class9-english.png',
    pdfPath: ''
  },
  {
    title: 'Hindi – Kshitij (Class 9)',
    class: 9,
    subject: 'Hindi',
    language: 'Hindi',
    description: 'NCERT Hindi textbook "Kshitij" for Class 9. Features selected Hindi literature including poetry, stories, and essays from prominent Hindi authors.',
    coverImage: '/images/covers/class9-hindi.png',
    pdfPath: ''
  },
  {
    title: 'Social Science – Class 9',
    class: 9,
    subject: 'Social Science',
    language: 'English',
    description: 'NCERT Social Science textbook for Class 9 covering history (India and the contemporary world), geography (contemporary India), political science (democratic politics), and economics.',
    coverImage: '/images/covers/class9-socialscience.png',
    pdfPath: ''
  },

  // ── Class 10 ────────────────────────────
  {
    title: 'Mathematics – Class 10',
    class: 10,
    subject: 'Mathematics',
    language: 'English',
    description: 'NCERT Mathematics textbook for Class 10 covering real numbers, polynomials, pair of linear equations, quadratic equations, arithmetic progressions, triangles, coordinate geometry, trigonometry, circles, constructions, areas, surface areas, volumes, statistics, and probability.',
    coverImage: '/images/covers/class10-maths.png',
    pdfPath: ''
  },
  {
    title: 'Science – Class 10',
    class: 10,
    subject: 'Science',
    language: 'English',
    description: 'NCERT Science textbook for Class 10 covering chemical reactions, acids, bases, salts, metals, non-metals, carbon compounds, life processes, control and coordination, heredity, evolution, light, electricity, magnetic effects, and environment.',
    coverImage: '/images/covers/class10-science.png',
    pdfPath: ''
  },
  {
    title: 'English – First Flight (Class 10)',
    class: 10,
    subject: 'English',
    language: 'English',
    description: 'NCERT English textbook "First Flight" for Class 10. Contains prose and poetry selections designed to enhance language proficiency, critical thinking, and literary skills.',
    coverImage: '/images/covers/class10-english.png',
    pdfPath: ''
  },
  {
    title: 'Hindi – Kshitij Part 2 (Class 10)',
    class: 10,
    subject: 'Hindi',
    language: 'Hindi',
    description: 'NCERT Hindi textbook "Kshitij Part 2" for Class 10. Continues the journey through Hindi literature with advanced prose and poetry from celebrated authors.',
    coverImage: '/images/covers/class10-hindi.png',
    pdfPath: ''
  },
  {
    title: 'Social Science – Class 10',
    class: 10,
    subject: 'Social Science',
    language: 'English',
    description: 'NCERT Social Science textbook for Class 10 covering history (India and the contemporary world), geography (contemporary India), political science (democratic politics), and economics (understanding economic development).',
    coverImage: '/images/covers/class10-socialscience.png',
    pdfPath: ''
  },
  
  // ── Maharashtra Board - Class 9 ────────────────────────────
  {
    title: 'Maharashtra Board – Mathematics (Class 9)',
    class: 9,
    subject: 'Mathematics',
    language: 'English',
    description: 'Maharashtra State Board Mathematics textbook for Class 9 (Algebra and Geometry).',
    coverImage: '/images/covers/class9-maths.png',
    pdfPath: ''
  },
  {
    title: 'Maharashtra Board – Science & Technology (Class 9)',
    class: 9,
    subject: 'Science',
    language: 'English',
    description: 'Maharashtra State Board Science and Technology textbook for Class 9.',
    coverImage: '/images/covers/class9-science.png',
    pdfPath: ''
  },
  {
    title: 'Maharashtra Board – English (Class 9)',
    class: 9,
    subject: 'English',
    language: 'English',
    description: 'Maharashtra State Board English Kumarbharati textbook for Class 9.',
    coverImage: '/images/covers/class9-english.png',
    pdfPath: ''
  },
  {
    title: 'Maharashtra Board – Marathi (Class 9)',
    class: 9,
    subject: 'Marathi',
    language: 'Marathi',
    description: 'Maharashtra State Board Marathi Aksharbharati textbook for Class 9.',
    coverImage: '/images/default-cover.png',
    pdfPath: ''
  },
  {
    title: 'Maharashtra Board – History & Geography (Class 9)',
    class: 9,
    subject: 'Social Science',
    language: 'English',
    description: 'Maharashtra State Board History and Political Science, and Geography textbooks for Class 9.',
    coverImage: '/images/covers/class9-socialscience.png',
    pdfPath: ''
  },

  // ── Maharashtra Board - Class 10 ────────────────────────────
  {
    title: 'Maharashtra Board – Mathematics (Class 10)',
    class: 10,
    subject: 'Mathematics',
    language: 'English',
    description: 'Maharashtra State Board Mathematics textbook for Class 10 (Algebra and Geometry).',
    coverImage: '/images/covers/class10-maths.png',
    pdfPath: ''
  },
  {
    title: 'Maharashtra Board – Science & Technology (Class 10)',
    class: 10,
    subject: 'Science',
    language: 'English',
    description: 'Maharashtra State Board Science and Technology textbook for Class 10 (Part 1 and 2).',
    coverImage: '/images/covers/class10-science.png',
    pdfPath: ''
  },
  {
    title: 'Maharashtra Board – English (Class 10)',
    class: 10,
    subject: 'English',
    language: 'English',
    description: 'Maharashtra State Board English Kumarbharati textbook for Class 10.',
    coverImage: '/images/covers/class10-english.png',
    pdfPath: ''
  },
  {
    title: 'Maharashtra Board – Marathi (Class 10)',
    class: 10,
    subject: 'Marathi',
    language: 'Marathi',
    description: 'Maharashtra State Board Marathi Aksharbharati textbook for Class 10.',
    coverImage: '/images/default-cover.png',
    pdfPath: ''
  },
  {
    title: 'Maharashtra Board – History & Geography (Class 10)',
    class: 10,
    subject: 'Social Science',
    language: 'English',
    description: 'Maharashtra State Board History and Political Science, and Geography textbooks for Class 10.',
    coverImage: '/images/covers/class10-socialscience.png',
    pdfPath: ''
  }
];

/**
 * Seed the database with sample data.
 */
const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    try { await Book.collection.drop(); } catch (e) {} // drop collection to reset indexes
    try { await Admin.collection.drop(); } catch (e) {}

    // Seed books
    console.log('📚 Seeding books...');
    const books = await Book.insertMany(sampleBooks);
    console.log(`   ✅ ${books.length} books added.`);

    // Seed admin
    console.log('👤 Creating admin account...');
    const admin = new Admin({
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    });
    await admin.save();
    console.log(`   ✅ Admin created (username: ${admin.username})`);

    console.log('\n🎉 Database seeded successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
