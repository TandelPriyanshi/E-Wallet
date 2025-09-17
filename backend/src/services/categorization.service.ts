import logger from '../utils/logger';

export interface CategoryMatch {
  category: string;
  confidence: number;
  subcategory?: string;
}

export class CategorizationService {
  private static instance: CategorizationService;
  
  private constructor() {}

  public static getInstance(): CategorizationService {
    if (!CategorizationService.instance) {
      CategorizationService.instance = new CategorizationService();
    }
    return CategorizationService.instance;
  }

  // Category mapping with keywords and vendor patterns
  private categoryMap: Record<string, {
    keywords: string[];
    vendors: string[];
    subcategories?: string[];
  }> = {
    'Electronics': {
      keywords: ['phone', 'laptop', 'computer', 'tablet', 'headphones', 'speaker', 'camera', 'tv', 'monitor', 'keyboard', 'mouse', 'charger', 'cable', 'electronics', 'gadget', 'smartphone', 'iphone', 'android', 'macbook', 'ipad'],
      vendors: ['apple', 'samsung', 'sony', 'lg', 'dell', 'hp', 'lenovo', 'asus', 'microsoft', 'google', 'amazon', 'best buy', 'circuit city', 'fry\'s'],
      subcategories: ['Mobile Phones', 'Computers', 'Audio/Video', 'Accessories']
    },
    'Home & Garden': {
      keywords: ['furniture', 'sofa', 'chair', 'table', 'bed', 'mattress', 'lamp', 'garden', 'plant', 'tools', 'drill', 'hammer', 'paint', 'brush', 'home improvement', 'decor', 'curtain', 'rug', 'kitchen', 'appliance'],
      vendors: ['ikea', 'home depot', 'lowes', 'wayfair', 'bed bath beyond', 'target', 'walmart'],
      subcategories: ['Furniture', 'Tools', 'Decor', 'Kitchen', 'Garden']
    },
    'Clothing & Accessories': {
      keywords: ['shirt', 'pants', 'dress', 'shoes', 'jacket', 'coat', 'hat', 'bag', 'wallet', 'watch', 'jewelry', 'clothing', 'apparel', 'fashion', 'sneakers', 'boots', 'jeans', 'sweater'],
      vendors: ['nike', 'adidas', 'zara', 'h&m', 'uniqlo', 'gap', 'old navy', 'macy\'s', 'nordstrom', 'amazon fashion'],
      subcategories: ['Clothing', 'Shoes', 'Accessories', 'Jewelry']
    },
    'Food & Beverages': {
      keywords: ['grocery', 'food', 'restaurant', 'coffee', 'tea', 'juice', 'water', 'snack', 'meal', 'dining', 'lunch', 'dinner', 'breakfast', 'pizza', 'burger', 'sandwich'],
      vendors: ['starbucks', 'mcdonalds', 'subway', 'walmart', 'target', 'whole foods', 'kroger', 'safeway', 'costco', 'trader joe\'s'],
      subcategories: ['Groceries', 'Restaurants', 'Beverages', 'Snacks']
    },
    'Health & Beauty': {
      keywords: ['pharmacy', 'medicine', 'prescription', 'vitamin', 'supplement', 'cosmetics', 'skincare', 'shampoo', 'toothpaste', 'soap', 'perfume', 'makeup', 'health', 'beauty', 'personal care'],
      vendors: ['cvs', 'walgreens', 'rite aid', 'sephora', 'ulta', 'pharmacy'],
      subcategories: ['Pharmacy', 'Cosmetics', 'Personal Care', 'Health Supplements']
    },
    'Automotive': {
      keywords: ['car', 'auto', 'vehicle', 'gas', 'fuel', 'oil', 'tire', 'battery', 'repair', 'maintenance', 'service', 'parts', 'automotive'],
      vendors: ['shell', 'exxon', 'chevron', 'bp', 'mobil', 'jiffy lube', 'valvoline', 'autozone', 'advance auto'],
      subcategories: ['Fuel', 'Maintenance', 'Parts', 'Repairs']
    },
    'Books & Media': {
      keywords: ['book', 'magazine', 'newspaper', 'movie', 'dvd', 'cd', 'music', 'game', 'software', 'subscription', 'streaming'],
      vendors: ['amazon', 'barnes noble', 'netflix', 'spotify', 'steam', 'apple music', 'google play'],
      subcategories: ['Books', 'Movies', 'Music', 'Games', 'Subscriptions']
    },
    'Services': {
      keywords: ['service', 'repair', 'maintenance', 'cleaning', 'consultation', 'professional', 'labor', 'installation', 'support'],
      vendors: [],
      subcategories: ['Professional Services', 'Repairs', 'Maintenance', 'Consultation']
    },
    'Other': {
      keywords: [],
      vendors: [],
      subcategories: []
    }
  };

  public categorizeByText(text: string, vendorName?: string, productName?: string): CategoryMatch {
    const normalizedText = text.toLowerCase();
    const normalizedVendor = vendorName?.toLowerCase() || '';
    const normalizedProduct = productName?.toLowerCase() || '';
    
    const allText = `${normalizedText} ${normalizedVendor} ${normalizedProduct}`.toLowerCase();

    let bestMatch: CategoryMatch = { category: 'Other', confidence: 0 };

    for (const [category, config] of Object.entries(this.categoryMap)) {
      let score = 0;
      let matches = 0;

      // Check vendor matches (high weight)
      for (const vendor of config.vendors) {
        if (normalizedVendor.includes(vendor) || allText.includes(vendor)) {
          score += 10;
          matches++;
        }
      }

      // Check keyword matches
      for (const keyword of config.keywords) {
        if (allText.includes(keyword)) {
          score += 5;
          matches++;
        }
      }

      // Calculate confidence based on matches and text relevance
      const confidence = Math.min(100, (score / Math.max(1, config.keywords.length + config.vendors.length)) * 100);

      if (confidence > bestMatch.confidence && matches > 0) {
        bestMatch = {
          category,
          confidence: Math.round(confidence),
          subcategory: this.getSubcategory(allText, config.subcategories || [])
        };
      }
    }

    // If no good match found, default to 'Other'
    if (bestMatch.confidence < 30) {
      bestMatch = { category: 'Other', confidence: 100 };
    }

    logger.info('Categorization result', {
      text: text.substring(0, 100),
      vendor: vendorName,
      result: bestMatch
    });

    return bestMatch;
  }

  private getSubcategory(text: string, subcategories: string[]): string | undefined {
    const subcategoryKeywords: Record<string, string[]> = {
      'Mobile Phones': ['phone', 'smartphone', 'iphone', 'android', 'cell'],
      'Computers': ['laptop', 'computer', 'desktop', 'pc', 'mac'],
      'Audio/Video': ['headphones', 'speaker', 'tv', 'monitor', 'camera'],
      'Accessories': ['charger', 'cable', 'case', 'screen protector'],
      'Furniture': ['sofa', 'chair', 'table', 'bed', 'mattress'],
      'Tools': ['drill', 'hammer', 'screwdriver', 'saw'],
      'Kitchen': ['kitchen', 'cooking', 'utensil', 'pot', 'pan'],
      'Clothing': ['shirt', 'pants', 'dress', 'jacket'],
      'Shoes': ['shoes', 'sneakers', 'boots', 'sandals'],
      'Groceries': ['grocery', 'food', 'produce', 'dairy'],
      'Restaurants': ['restaurant', 'dining', 'takeout', 'delivery'],
      'Fuel': ['gas', 'fuel', 'gasoline', 'diesel'],
      'Maintenance': ['oil change', 'service', 'maintenance', 'inspection']
    };

    for (const subcategory of subcategories) {
      const keywords = subcategoryKeywords[subcategory] || [];
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          return subcategory;
        }
      }
    }

    return subcategories[0]; // Return first subcategory as default
  }

  public getAllCategories(): string[] {
    return Object.keys(this.categoryMap);
  }

  public getSubcategoriesForCategory(category: string): string[] {
    return this.categoryMap[category]?.subcategories || [];
  }
}

export const categorizationService = CategorizationService.getInstance();
