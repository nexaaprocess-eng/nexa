import {ProductKind} from '../../components/grocery';

// HYPOTHETICAL basket (claim I01 in content/episode-002/claims.json). Prices and costs are invented for
// illustration and chosen so the basket's gross margin lands near Kroger's reported 22.9 %. Not store data.
export type BasketItem = {name: string; kind: ProductKind; price: number; cost: number};

export const BASKET: BasketItem[] = [
  {name: 'Milk', kind: 'milk', price: 3.8, cost: 3.65},
  {name: 'Eggs', kind: 'eggs', price: 3.5, cost: 3.1},
  {name: 'Bananas', kind: 'bananas', price: 1.8, cost: 1.3},
  {name: 'Bread', kind: 'bread', price: 3.2, cost: 2.4},
  {name: 'National-brand cereal', kind: 'cereal', price: 5.5, cost: 4.4},
  {name: 'Store-brand cereal', kind: 'storecereal', price: 3.9, cost: 2.5},
  {name: 'Coffee', kind: 'coffee', price: 9.0, cost: 6.8},
  {name: 'Deli meal', kind: 'deli', price: 8.5, cost: 5.1},
  {name: 'Pasta & sauce', kind: 'pasta', price: 4.8, cost: 3.6},
  {name: 'Detergent', kind: 'detergent', price: 10.0, cost: 8.6},
];

export const BASKET_PRICE = BASKET.reduce((a, b) => a + b.price, 0); // 54.00
export const BASKET_COST = BASKET.reduce((a, b) => a + b.cost, 0); // 41.45
export const BASKET_GM = (BASKET_PRICE - BASKET_COST) / BASKET_PRICE; // 0.2324
export const margin = (b: BasketItem) => (b.price - b.cost) / b.price;
