/*export type CategoryKey =
  | "electronics"
  | "fashion"
  | "furniture"
  | "books"
  | "home_appliances"
  | "sports"
  | "beauty"
  | "toys"
  | "other";*/

export type FieldType<T = string> = {
  name: string;
  fieldType:
    | "text"
    | "number"
    | "select"
    | "textarea"
    | "multiselect"
    | "currency"
    | "phone";
  label: string;
  placeholder?: string;
  col?: number;
  options?: { key?:T; value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
}
