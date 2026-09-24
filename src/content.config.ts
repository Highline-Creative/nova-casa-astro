import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const propertySchema = z.object({
  order: z.number().default(999),
  title: z.string(),
  subtitle: z.string(),
  community: z.string(),
  building: z.string().optional(),
  location: z.string(),
  price: z.string(),
  priceNote: z.string().optional(),
  type: z.string(),
  purpose: z.string(),
  beds: z.number(),
  baths: z.number(),
  size: z.string(),
  parking: z.string().optional(),
  floor: z.string().optional(),
  view: z.string().optional(),
  balcony: z.string().optional(),
  furnishing: z.string(),
  status: z.string().optional(),
  videoUrl: z.string().optional(),
  images: z.array(z.string()),
  description: z.array(z.string()),
  features: z.array(z.string()),
  amenities: z.array(z.string()),
  nearby: z.array(z.string()).optional(),
});

const faqSchema = z.object({
  category: z.string(),
  order: z.number(),
  question: z.string(),
  answer: z.string(),
  openByDefault: z.boolean().optional(),
});

const blogSchema = z.object({
  title: z.string(),
  pillar: z.string(),
  excerpt: z.string(),
  publishDate: z.date(),
  coverImage: z.string(),
  coverAlt: z.string(),
  author: z.string().default("Carla Santos"),
});

export const collections = {
  "properties-en": defineCollection({
    loader: glob({ pattern: "*.json", base: "./src/content/properties/en" }),
    schema: propertySchema,
  }),
  "properties-pt": defineCollection({
    loader: glob({ pattern: "*.json", base: "./src/content/properties/pt-br" }),
    schema: propertySchema,
  }),
  "faq-en": defineCollection({
    loader: glob({ pattern: "*.json", base: "./src/content/faq/en" }),
    schema: faqSchema,
  }),
  "faq-pt": defineCollection({
    loader: glob({ pattern: "*.json", base: "./src/content/faq/pt-br" }),
    schema: faqSchema,
  }),
  "blog-en": defineCollection({
    loader: glob({ pattern: "*.md", base: "./src/content/blog/en" }),
    schema: blogSchema,
  }),
  "blog-pt": defineCollection({
    loader: glob({ pattern: "*.md", base: "./src/content/blog/pt-br" }),
    schema: blogSchema,
  }),
};
