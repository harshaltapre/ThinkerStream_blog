import { Badge } from "@/components/ui/badge";
import type { Category } from "@shared/schema";

interface CategoryTagProps {
  category: Category;
}

export default function CategoryTag({ category }: CategoryTagProps) {
  return (
    <Badge variant="secondary" className="category-tag">
      {category.name}
    </Badge>
  );
}
