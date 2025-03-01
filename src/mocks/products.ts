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
    count: 32
  },
  {
    id: '3',
    title: 'Google Pixel 6',
    description: 'Google Pixel with advanced AI features and great camera',
    price: 599,
    count: 15
  },
  {
    id: '4',
    title: 'OnePlus 9 Pro',
    description: 'Fast charging flagship with Hasselblad camera partnership',
    price: 899,
    count: 18
  },
  {
    id: '5',
    title: 'Xiaomi Mi 11',
    description: 'Powerful Snapdragon processor with 108MP camera',
    price: 749,
    count: 27
  }
];