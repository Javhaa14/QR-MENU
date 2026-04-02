export type SlotName =
  | "hero"
  | "categoryNav"
  | "itemCard"
  | "categoryHeader"
  | "footer";

export type ThemeRadius = "none" | "sm" | "md" | "lg" | "full";

export type UserRole = "superadmin" | "restaurant_admin";
export type RestaurantPlan = "free" | "pro";
export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export interface ThemeColors {
  primary: string;
  bg: string;
  text: string;
  accent: string;
}

export interface ThemeConfig {
  colors: ThemeColors;
  font: string;
  borderRadius: ThemeRadius;
  darkMode?: boolean;
  showImages?: boolean;
  heroImage?: string;
  components: Record<SlotName, string>;
}

export interface Restaurant {
  _id?: string;
  slug: string;
  name: string;
  logo?: string;
  themeConfig: ThemeConfig;
  plan?: RestaurantPlan;
  isActive: boolean;
  createdAt?: string;
}

export interface MenuItem {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  image?: string;
  tags: string[];
  allergens: string[];
  isAvailable: boolean;
}

export interface Category {
  _id?: string;
  name: string;
  position?: number;
  items: MenuItem[];
}

export interface Menu {
  _id?: string;
  restaurantId: string;
  name: string;
  isActive?: boolean;
  categories: Category[];
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
}

export interface Order {
  _id?: string;
  restaurantId: string;
  tableNumber?: string;
  items: OrderItem[];
  status: OrderStatus;
  totalPrice: number;
  createdAt?: string;
}

export interface PublicMenuResponse {
  restaurant: Pick<
    Restaurant,
    "_id" | "name" | "slug" | "logo" | "themeConfig" | "isActive"
  >;
  menu: Menu;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    _id: string;
    email: string;
    restaurantId: string | null;
    role: UserRole;
  };
}

export interface RestaurantListItem extends Restaurant {
  ordersToday: number;
}

export interface StaffUser {
  _id: string;
  email: string;
  restaurantId: string | null;
  role: UserRole;
}

export interface RestaurantStats {
  totalOrders: number;
  revenue: number;
  byStatus: Record<OrderStatus, number>;
}

export interface HeroProps {
  restaurant: Restaurant;
}

export interface CategoryNavProps {
  categories: Category[];
  activeCategoryId?: string;
  onSelect?: (categoryId: string) => void;
}

export interface CategoryHeaderProps {
  category: Category;
}

export interface ItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export interface FooterProps {
  restaurant: Restaurant;
}
