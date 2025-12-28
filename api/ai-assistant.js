// /api/ai-assistant.js
import { OpenAI } from 'openai';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get products from database (simulated)
    const products = getPPEProducts();
    
    // Create AI response
    const response = await generateAIResponse(message, history, products);

    // Get relevant product recommendations
    const recommendations = getRelevantProducts(message, products);

    return res.status(200).json({
      text: response,
      recommendations: recommendations.slice(0, 4), // Limit to 4 products
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Assistant error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate response',
      message: error.message 
    });
  }
}

async function generateAIResponse(userMessage, history, products) {
  // Try to use OpenAI if API key is available
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (openaiApiKey) {
    try {
      const openai = new OpenAI({
        apiKey: openaiApiKey
      });

      // Create conversation context
      const messages = [
        {
          role: "system",
          content: `You are an AI Safety Assistant for PPE Marts, a Personal Protective Equipment affiliate website. 
          You provide expert advice on safety equipment, regulations (OSHA, ANSI, etc.), and product recommendations.
          
          Available PPE categories: 
          1. Respiratory (masks, respirators)
          2. Head Protection (helmets, hard hats)
          3. Eye Protection (goggles, glasses)
          4. Hearing Protection (ear plugs, muffs)
          5. Hand Protection (gloves)
          6. Body Protection (vests, suits, gowns)
          7. Foot Protection (safety shoes, boots)
          8. Fall Protection (harnesses, lanyards)
          
          Guidelines:
          - Always prioritize safety
          - Mention relevant standards when applicable
          - Recommend specific product types, not brands unless asked
          - Be concise but thorough
          - Include practical usage tips
          - When recommending products, suggest the category first
          
          Format responses naturally and helpfully.`
        }
      ];

      // Add conversation history
      if (history && history.length > 0) {
        history.forEach(msg => {
          messages.push({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          });
        });
      }

      // Add current message
      messages.push({
        role: "user",
        content: userMessage
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.warn('OpenAI API failed, using fallback:', error);
    }
  }

  // Fallback responses if no OpenAI or API fails
  return generateFallbackResponse(userMessage, products);
}

function generateFallbackResponse(userMessage, products) {
  const message = userMessage.toLowerCase();
  
  const responses = {
    // Construction PPE
    'construction': "For construction work, OSHA requires: hard hat (ANSI Z89.1), safety glasses, high-vis vest, steel-toe boots (ASTM F2413), and gloves. Additional PPE needed for specific tasks: hearing protection for loud areas, respirators for dust, fall protection for heights over 6 feet.",
    
    'hard hat': "Hard hats must be ANSI Z89.1 certified. Types: Class G (general, 2,200V), Class E (electrical, 20,000V), Class C (conductive, no voltage protection). Replace after any significant impact or every 5 years.",
    
    // Gloves
    'glove': "Select gloves based on hazard: Chemical - nitrile/rubber, Cut - Kevlar/metal mesh, Heat - aluminized/leather, Cold - insulated, General - leather/canvas. Ensure proper fit and dexterity.",
    
    'chemical glove': "For chemical protection: Nitrile for oils/solvents, Butyl rubber for ketones/esters, Neoprene for acids/alcohols, Viton for chlorinated/aromatic solvents. Check chemical compatibility charts.",
    
    // Respiratory
    'respirator': "Respirator types: N95 for particles, half-face for gases/vapors with cartridges, full-face for eye/respiratory combo, PAPR for comfort in extended use. Fit testing required annually.",
    
    'mask': "Mask types: Surgical - fluid resistance, N95 - 95% particle filtration, KN95 - Chinese standard, FFP2 - European standard. Ensure proper seal and replace when damaged/soiled.",
    
    // Fall Protection
    'fall': "Fall protection system: Full-body harness, shock-absorbing lanyard (6 ft max), anchor point (5,000 lb rating), rescue plan. Inspect before each use. OSHA requires training.",
    
    'harness': "Harness features: Dorsal D-ring for fall arrest, shoulder D-rings for retrieval, side D-rings for positioning, chest D-ring for ladder climbing. Fit: 1-2 fingers between leg straps and thighs.",
    
    // Foot Protection
    'safety shoe': "Safety shoe standards: ASTM F2413 for impact/compression, EH for electrical hazard, SD for static dissipative, PR for puncture resistant. Match to workplace hazards.",
    
    // Eye Protection
    'goggle': "Eye protection: Safety glasses for impact, goggles for chemical splash, face shields for face/eye combo, welding helmets for arc flash. ANSI Z87.1 certification required.",
    
    // General Safety
    'osha': "Key OSHA PPE standards: 1910.132 (General Requirements), 1910.133 (Eye/Face), 1910.134 (Respiratory), 1910.135 (Head), 1910.136 (Foot), 1910.137 (Electrical), 1910.138 (Hand).",
    
    'regulation': "PPE regulations vary by: Industry (construction, healthcare, manufacturing), Country (OSHA-US, CE-Europe), Hazard type. Always consult local regulations and conduct hazard assessments.",
    
    // Default
    'default': "I'm here to help with PPE safety! I can assist with product selection, safety regulations, hazard assessments, and proper usage guidelines. Please ask about specific equipment or safety scenarios."
  };

  // Find matching response
  for (const [key, response] of Object.entries(responses)) {
    if (message.includes(key)) {
      return response;
    }
  }

  return responses.default;
}

function getPPEProducts() {
  // In production, this would query your database
  // For now, return sample products
  return [
    {
      id: 1,
      name: "Personal Protective Equipment KIT (PPE KIT)",
      category: "body",
      brand: "SafetyPro",
      image: "assets/images/products/ppe-kit.jpg",
      affiliateLink: "https://amzn.to/4bcAm6e",
      description: "Complete PPE kit for full body protection",
      rating: 4.5,
      badge: "Bestseller"
    },
    {
      id: 2,
      name: "Serplex Gas Mask Set Respirator",
      category: "respiratory",
      brand: "Serplex",
      image: "assets/images/products/gas-mask.jpg",
      affiliateLink: "https://amzn.to/4s4Fr6K",
      description: "Gas mask with respirator for chemical protection",
      rating: 4.3,
      badge: "Industrial"
    },
    {
      id: 3,
      name: "Non Woven Polypropylene Disposable Gown",
      category: "body",
      brand: "MediSafe",
      image: "assets/images/products/disposable-gown.jpg",
      affiliateLink: "https://amzn.to/49rqlRr",
      description: "Disposable protective gown for medical use",
      rating: 4.2,
      badge: "Medical"
    },
    {
      id: 4,
      name: "CF IND Full Body Safety Harness",
      category: "fall",
      brand: "CF IND",
      image: "assets/images/products/safety-harness.jpg",
      affiliateLink: "https://amzn.to/4jh3StM",
      description: "Full body harness for fall protection",
      rating: 4.7,
      badge: "Premium"
    },
    {
      id: 5,
      name: "Karam Magna Premium Full Body Safety Harness",
      category: "fall",
      brand: "Karam",
      image: "assets/images/products/premium-harness.jpg",
      affiliateLink: "https://amzn.to/494Ws89",
      description: "Premium safety harness with comfort padding",
      rating: 4.8,
      badge: "Top Rated"
    },
    {
      id: 6,
      name: "Safety Goggles Anti-Fog",
      category: "eye",
      brand: "VisionSafe",
      image: "assets/images/products/safety-goggles.jpg",
      affiliateLink: "#",
      description: "Anti-fog safety goggles with UV protection",
      rating: 4.4
    },
    {
      id: 7,
      name: "Industrial Safety Helmet",
      category: "head",
      brand: "HardHat Pro",
      image: "assets/images/products/safety-helmet.jpg",
      affiliateLink: "#",
      description: "Industrial safety helmet with chin strap",
      rating: 4.6,
      badge: "Bestseller"
    },
    {
      id: 8,
      name: "Safety Shoes Steel Toe",
      category: "foot",
      brand: "FootGuard",
      image: "assets/images/products/safety-shoes.jpg",
      affiliateLink: "#",
      description: "Steel toe safety shoes with slip resistance",
      rating: 4.5
    },
    {
      id: 9,
      name: "Nitrile Gloves Box of 100",
      category: "hand",
      brand: "GloveMaster",
      image: "assets/images/products/nitrile-gloves.jpg",
      affiliateLink: "#",
      description: "Nitrile gloves box of 100 pieces",
      rating: 4.7,
      badge: "Medical"
    }
  ];
}

function getRelevantProducts(userMessage, products) {
  const message = userMessage.toLowerCase();
  const relevantCategories = [];

  // Map keywords to categories
  const keywordMap = {
    // Respiratory
    'mask': 'respiratory',
    'respirator': 'respiratory',
    'breathing': 'respiratory',
    'lung': 'respiratory',
    'n95': 'respiratory',
    
    // Head
    'helmet': 'head',
    'hard hat': 'head',
    'head': 'head',
    'helmet': 'head',
    
    // Eye
    'goggle': 'eye',
    'glasses': 'eye',
    'eye': 'eye',
    'vision': 'eye',
    
    // Hand
    'glove': 'hand',
    'hand': 'hand',
    
    // Body
    'suit': 'body',
    'gown': 'body',
    'vest': 'body',
    'body': 'body',
    'ppe kit': 'body',
    
    // Foot
    'shoe': 'foot',
    'boot': 'foot',
    'foot': 'foot',
    
    // Fall
    'harness': 'fall',
    'fall': 'fall',
    'height': 'fall',
    'lanyard': 'fall'
  };

  // Find relevant categories
  for (const [keyword, category] of Object.entries(keywordMap)) {
    if (message.includes(keyword)) {
      relevantCategories.push(category);
    }
  }

  // If no specific categories found, return random products
  if (relevantCategories.length === 0) {
    return [...products].sort(() => 0.5 - Math.random()).slice(0, 4);
  }

  // Filter products by relevant categories
  return products
    .filter(product => relevantCategories.includes(product.category))
    .slice(0, 4);
}