// This file contains product data for Lambda functions
// It's a direct copy of the data to avoid import path issues

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  count: number;
}

export const productsList: Product[] = [
  {
    id: '1',
    title: 'Apple iPhone 13 Pro',
    description: 'Latest iPhone with A15 Bionic chip and Pro camera system',
    price: 999,
    count: 25
  },
  {
    id: '2',
    title: 'Samsung Galaxy S21',
    description: 'Flagship Android phone with 120Hz display and 8K video',
    price: 799,
    count: 30
  }
  // Add all other products from the original file
];