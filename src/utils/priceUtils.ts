
export const formatPrice = (price: number | string | null | undefined): string => {
  if (price === null || price === undefined || price === '') {
    return '0';
  }
  
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) {
    return '0';
  }
  
  return numericPrice.toLocaleString();
};

export const formatPriceWithFixed = (price: number | string | null | undefined, decimals: number = 2): string => {
  if (price === null || price === undefined || price === '') {
    return '0.00';
  }
  
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) {
    return '0.00';
  }
  
  return numericPrice.toFixed(decimals);
};

export const safeParsePrice = (price: number | string | null | undefined): number => {
  if (price === null || price === undefined || price === '') {
    return 0;
  }
  
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) {
    return 0;
  }
  
  return numericPrice;
};

export const isValidProduct = (product: any): boolean => {
  return product && 
         product.id && 
         typeof product.price !== 'undefined' && 
         product.price !== null &&
         !isNaN(safeParsePrice(product.price));
};

export const formatPriceSafe = (price: any): string => {
  const numericPrice = safeParsePrice(price);
  return typeof numericPrice === 'number' ? formatPrice(numericPrice) : 'N/A';
};
