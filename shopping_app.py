"""A simple shopping app domain model."""

from dataclasses import dataclass


@dataclass
class CartItem:
    name: str
    price: float
    quantity: int = 1

    def __post_init__(self) -> None:
        if self.price < 0:
            raise ValueError("price must be non-negative")
        if self.quantity <= 0:
            raise ValueError("quantity must be greater than zero")

    @property
    def total(self) -> float:
        return self.price * self.quantity


class ShoppingCart:
    def __init__(self) -> None:
        self._items: dict[str, CartItem] = {}

    def add_item(self, name: str, price: float, quantity: int = 1) -> None:
        if name in self._items:
            current = self._items[name]
            self._items[name] = CartItem(
                name=name,
                price=price,
                quantity=current.quantity + quantity,
            )
            return
        self._items[name] = CartItem(name=name, price=price, quantity=quantity)

    def remove_item(self, name: str) -> None:
        self._items.pop(name, None)

    def is_empty(self) -> bool:
        return not self._items

    def total_items(self) -> int:
        return sum(item.quantity for item in self._items.values())

    def subtotal(self) -> float:
        return round(sum(item.total for item in self._items.values()), 2)

    def checkout_summary(self) -> dict[str, float | int]:
        return {
            "items": self.total_items(),
            "subtotal": self.subtotal(),
        }
