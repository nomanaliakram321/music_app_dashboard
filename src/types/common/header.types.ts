export interface HeaderProps {
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange: (query: string) => void;
}
