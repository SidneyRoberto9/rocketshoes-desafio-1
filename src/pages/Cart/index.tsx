import React from 'react';
import {
  MdAddCircleOutline,
  MdDelete,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  const cartFormatted = cart.map(({ price, ...item }) => ({
    ...item,
    price: price,
    priceFormatted: formatPrice(price),
    priceSubTotalFormatted: formatPrice(price * item.amount),
  }));

  const total = formatPrice(
    cart.reduce((sumTotal, product) => {
      return sumTotal + product.price * product.amount;
    }, 0),
  );

  function handleProductIncrement(productId: number, amount: number) {
    updateProductAmount({ productId: productId, amount: amount + 1 });
  }

  function handleProductDecrement(productId: number, amount: number) {
    updateProductAmount({ productId: productId, amount: amount - 1 });
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId);
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cartFormatted.map(
            ({
              amount,
              id,
              image,
              price,
              title,
              priceFormatted,
              priceSubTotalFormatted,
            }) => (
              <tr data-testid="product" key={id}>
                <td>
                  <img src={image} alt={title} />
                </td>
                <td>
                  <strong>{title}</strong>
                  <span>{priceFormatted}</span>
                </td>
                <td>
                  <div>
                    <button
                      type="button"
                      data-testid="decrement-product"
                      disabled={amount <= 1}
                      onClick={() => handleProductDecrement(id, amount)}
                    >
                      <MdRemoveCircleOutline size={20} />
                    </button>
                    <input
                      type="text"
                      data-testid="product-amount"
                      readOnly
                      value={amount}
                    />
                    <button
                      type="button"
                      data-testid="increment-product"
                      onClick={() => handleProductIncrement(id, amount)}
                    >
                      <MdAddCircleOutline size={20} />
                    </button>
                  </div>
                </td>
                <td>
                  <strong>{priceSubTotalFormatted}</strong>
                </td>
                <td>
                  <button
                    type="button"
                    data-testid="remove-product"
                    onClick={() => handleRemoveProduct(id)}
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            ),
          )}
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
