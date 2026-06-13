import unittest

from shopping_app import ShoppingCart


class ShoppingCartTests(unittest.TestCase):
    def test_add_item_calculates_totals(self) -> None:
        cart = ShoppingCart()
        cart.add_item("apple", 1.50, 2)
        cart.add_item("banana", 0.75, 1)

        self.assertEqual(cart.total_items(), 3)
        self.assertEqual(cart.subtotal(), 3.75)
        self.assertEqual(cart.checkout_summary(), {"items": 3, "subtotal": 3.75})

    def test_add_existing_item_increases_quantity(self) -> None:
        cart = ShoppingCart()
        cart.add_item("apple", 1.50, 1)
        cart.add_item("apple", 1.50, 2)

        self.assertEqual(cart.total_items(), 3)
        self.assertEqual(cart.subtotal(), 4.5)

    def test_remove_item_and_empty_cart(self) -> None:
        cart = ShoppingCart()
        cart.add_item("apple", 1.50, 1)
        cart.remove_item("apple")

        self.assertTrue(cart.is_empty())
        self.assertEqual(cart.checkout_summary(), {"items": 0, "subtotal": 0})

    def test_rejects_invalid_values(self) -> None:
        cart = ShoppingCart()

        with self.assertRaises(ValueError):
            cart.add_item("apple", -1, 1)

        with self.assertRaises(ValueError):
            cart.add_item("apple", 1, 0)


if __name__ == "__main__":
    unittest.main()
