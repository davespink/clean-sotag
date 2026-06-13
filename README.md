# clean-sotag
A simple shopping app

## Run tests

```bash
python -m unittest discover -s tests -p "test_*.py"
```

## Example

```python
from shopping_app import ShoppingCart

cart = ShoppingCart()
cart.add_item("apple", 1.50, 2)
cart.add_item("banana", 0.75, 1)
print(cart.checkout_summary())  # {'items': 3, 'subtotal': 3.75}
```
