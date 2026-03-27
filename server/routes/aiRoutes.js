const express = require('express');
const router = express.Router();

// POST /api/ai/generate-layout — returns a static default layout (no AI)
router.post('/generate-layout', (req, res) => {
  console.log('>>> [Layout] Load Default Layout requested');

  const elements = [
    {
      id: 'el_header',
      type: 'heading',
      content: 'Welcome to My New Site',
      styles: {
        position: 'absolute', left: '0px', top: '0px',
        width: '900px', height: '80px',
        fontSize: '32px', fontWeight: 'bold',
        color: '#ffffff', backgroundColor: '#7c3aed',
        padding: '20px 40px', borderRadius: '0px',
        textAlign: 'center', zIndex: 2,
      },
    },
    {
      id: 'el_hero_heading',
      type: 'heading',
      content: 'Build Something Amazing',
      styles: {
        position: 'absolute', left: '0px', top: '120px',
        width: '900px', height: '80px',
        fontSize: '42px', fontWeight: 'bold',
        color: '#1a202c', backgroundColor: 'transparent',
        padding: '10px 40px', borderRadius: '0px',
        textAlign: 'center', zIndex: 2,
      },
    },
    {
      id: 'el_hero_text',
      type: 'text',
      content: 'Drag, drop, and customise your website with our easy-to-use visual editor. No coding required. Launch in minutes.',
      styles: {
        position: 'absolute', left: '0px', top: '220px',
        width: '900px', height: '80px',
        fontSize: '18px', fontWeight: 'normal',
        color: '#4a5568', backgroundColor: 'transparent',
        padding: '10px 80px', borderRadius: '0px',
        textAlign: 'center', zIndex: 2,
      },
    },
    {
      id: 'el_cta_button',
      type: 'button',
      content: 'Get Started Free',
      styles: {
        position: 'absolute', left: '330px', top: '330px',
        width: '240px', height: '56px',
        fontSize: '16px', fontWeight: 'bold',
        color: '#ffffff', backgroundColor: '#7c3aed',
        padding: '14px 32px', borderRadius: '12px',
        textAlign: 'center', zIndex: 2,
      },
    },
    {
      id: 'el_hero_image',
      type: 'image',
      content: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&q=80&w=900',
      styles: {
        position: 'absolute', left: '0px', top: '420px',
        width: '900px', height: '360px',
        fontSize: '0px', fontWeight: 'normal',
        color: 'transparent', backgroundColor: '#e2e8f0',
        padding: '0px', borderRadius: '0px',
        textAlign: 'center', zIndex: 1,
      },
    },
    {
      id: 'el_section_heading',
      type: 'heading',
      content: 'Why Choose Us',
      styles: {
        position: 'absolute', left: '0px', top: '820px',
        width: '900px', height: '70px',
        fontSize: '28px', fontWeight: 'bold',
        color: '#1a202c', backgroundColor: 'transparent',
        padding: '16px 40px', borderRadius: '0px',
        textAlign: 'center', zIndex: 2,
      },
    },
    {
      id: 'el_feat1_heading',
      type: 'heading',
      content: '⚡ Blazing Fast',
      styles: {
        position: 'absolute', left: '0px', top: '920px',
        width: '900px', height: '50px',
        fontSize: '22px', fontWeight: 'bold',
        color: '#7c3aed', backgroundColor: 'transparent',
        padding: '8px 80px', borderRadius: '0px',
        textAlign: 'left', zIndex: 2,
      },
    },
    {
      id: 'el_feat1_text',
      type: 'text',
      content: 'Our platform is optimised for speed. Pages load instantly and the editor responds in real time, making your workflow smooth and productive.',
      styles: {
        position: 'absolute', left: '0px', top: '990px',
        width: '900px', height: '80px',
        fontSize: '16px', fontWeight: 'normal',
        color: '#4a5568', backgroundColor: 'transparent',
        padding: '8px 80px', borderRadius: '0px',
        textAlign: 'left', zIndex: 2,
      },
    },
    {
      id: 'el_feat2_heading',
      type: 'heading',
      content: '🎨 Fully Customisable',
      styles: {
        position: 'absolute', left: '0px', top: '1100px',
        width: '900px', height: '50px',
        fontSize: '22px', fontWeight: 'bold',
        color: '#7c3aed', backgroundColor: 'transparent',
        padding: '8px 80px', borderRadius: '0px',
        textAlign: 'left', zIndex: 2,
      },
    },
    {
      id: 'el_feat2_text',
      type: 'text',
      content: 'Change colours, fonts, sizes, and positions with a single click. Every element is fully editable and can be arranged exactly how you envision it.',
      styles: {
        position: 'absolute', left: '0px', top: '1170px',
        width: '900px', height: '80px',
        fontSize: '16px', fontWeight: 'normal',
        color: '#4a5568', backgroundColor: 'transparent',
        padding: '8px 80px', borderRadius: '0px',
        textAlign: 'left', zIndex: 2,
      },
    },
    {
      id: 'el_feat3_heading',
      type: 'heading',
      content: '☁️ Cloud Saved',
      styles: {
        position: 'absolute', left: '0px', top: '1280px',
        width: '900px', height: '50px',
        fontSize: '22px', fontWeight: 'bold',
        color: '#7c3aed', backgroundColor: 'transparent',
        padding: '8px 80px', borderRadius: '0px',
        textAlign: 'left', zIndex: 2,
      },
    },
    {
      id: 'el_feat3_text',
      type: 'text',
      content: 'All your work is automatically saved to the cloud. Access your projects from any device, anytime, and never lose a single change again.',
      styles: {
        position: 'absolute', left: '0px', top: '1350px',
        width: '900px', height: '80px',
        fontSize: '16px', fontWeight: 'normal',
        color: '#4a5568', backgroundColor: 'transparent',
        padding: '8px 80px', borderRadius: '0px',
        textAlign: 'left', zIndex: 2,
      },
    },
    {
      id: 'el_footer',
      type: 'text',
      content: '© 2026 VividFloww — Build beautiful websites visually.',
      styles: {
        position: 'absolute', left: '0px', top: '1470px',
        width: '900px', height: '80px',
        fontSize: '14px', fontWeight: 'normal',
        color: '#94a3b8', backgroundColor: '#0f172a',
        padding: '28px 40px', borderRadius: '0px',
        textAlign: 'center', zIndex: 2,
      },
    },
  ];

  return res.json({ elements });
});

module.exports = router;