import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { toast } from 'react-toastify';

import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const cartItems = localStorage.getItem('@RocketShoes:cart');

    if (cartItems) {
      return JSON.parse(cartItems);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const { data: stock } = await api.get<Stock>(`/stock/${productId}`);

      const searchedProduct = cart.find((product) => product.id === productId);

      if (searchedProduct) {
        if (stock.amount <= searchedProduct.amount) {
          toast.error('Quantidade solicitada fora de estoque');
          return;
        }

        const updatedCharts = cart.map((item) => {
          if (item.id === productId) {
            return {
              ...item,
              amount: item.amount + 1,
            };
          }
          return item;
        });

        setCart(updatedCharts);
        localStorage.setItem(
          '@RocketShoes:cart',
          JSON.stringify(updatedCharts),
        );
        return;
      }

      const { data: product } = await api.get<Product>(
        `/products/${productId}`,
      );

      if (!product) {
        throw new Error();
      }

      const updatedCart = [...cart, { ...product, amount: 1 }];

      setCart(updatedCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const searchedProduct = cart.find((product) => product.id === productId);

      if (!searchedProduct) {
        throw new Error();
      }

      const updatedCart = cart.filter((product) => product.id !== productId);
      setCart(updatedCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const searchedProduct = cart.find((product) => product.id === productId);
      console.log(amount);
      if (!searchedProduct) {
        throw new Error();
      }

      if (amount <= 0) {
        return;
      }

      const { data: stock } = await api.get<Stock>(`/stock/${productId}`);

      if (stock.amount < amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      const updatedCart = cart.map((item) => {
        if (item.id === productId) {
          return {
            ...item,
            amount: amount,
          };
        }

        return item;
      });

      setCart(updatedCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
