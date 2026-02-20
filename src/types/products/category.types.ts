export interface Category {
  slug: string;
  name: string;
  url: string;
  productCount?: number;
  id?: number;
}

export interface CategorySidebarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}
