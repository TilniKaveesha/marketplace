import { object, string } from "zod";

export const signupSchema = object({
  name: string({
    required_error: "Name is required",
  }).min(1, {
    message: "Name is required",
  }).trim(),
  email: string({
    required_error: "Email is required",
  }).min(1, {
    message: "Email is required",
  }).email({
    message: "Please enter a valid email address",
  }).trim(),
  shopName: string({
    required_error: "Shop name is required",
  }).min(2, {
    message: "Shop name must be at least 2 characters",
  }).trim(),
  phone: string({
    required_error: "Phone number is required",
  }).min(1, {
    message: "Phone number is required",
  }).regex(/^\+\d{1,3}[\s-]?\d{9,12}$/, {
    message: "Please enter a valid phone number (e.g., +12345678901 or +1-234-567-8901)",
  }).trim(),
  idNumber: string({
    required_error: "ID number is required",
  }).min(6, {
    message: "ID number must be at least 6 characters",
  }).max(20, {
    message: "ID number must not exceed 20 characters",
  }).regex(/^[A-Za-z0-9-]+$/, {
    message: "ID number must be alphanumeric and may include hyphens",
  }).trim(),
  password: string({
    required_error: "Password is required",
  }).min(8, {
    message: "Password must be at least 8 characters",
  }).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: "Password must include at least one uppercase letter, one lowercase letter, and one number",
  }).trim(),
});

export const loginSchema = object({
  email: string({
    required_error: "Email is required",
  }).min(1, {
    message: "Email is required",
  }).email({
    message: "Please enter a valid email address",
  }).trim(),
  password: string({
    required_error: "Password is required",
  }).min(1, {
    message: "Password is required",
  }).trim(),
});