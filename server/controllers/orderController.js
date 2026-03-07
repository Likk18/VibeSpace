import Order from '../models/Order.js';
import User from '../models/User.js';

// Generate transaction ID: TXN + 8 random digits
const generateTransactionId = () => {
    return 'TXN' + Math.floor(10000000 + Math.random() * 90000000).toString();
};

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private
 */
export const createOrder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { items, total_amount, shipping_address, payment_method } = req.body;

        // Generate unique IDs
        const order_id = 'VS' + Math.floor(10000 + Math.random() * 90000).toString();
        const transaction_id = generateTransactionId();

        // Handle wallet payment
        if (payment_method === 'vibepay_wallet') {
            const user = await User.findById(userId);
            if ((user.vibepay_balance || 0) < total_amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient wallet balance'
                });
            }
            // Deduct balance
            user.vibepay_balance -= total_amount;
            await user.save();
        }

        // Determine payment status
        const payment_status = payment_method === 'cod' ? 'pending' : 'completed';

        const order = await Order.create({
            user: userId,
            items,
            total_amount,
            shipping_address,
            payment_method,
            payment_status,
            order_id,
            transaction_id
        });

        // Extract ordered product IDs
        const orderedProductIds = items.map(item => item.product);

        // Remove these items from user's cart and wishlist
        await User.findByIdAndUpdate(userId, { 
            $pull: { 
                cart: { $in: orderedProductIds },
                wishlist: { product: { $in: orderedProductIds } }
            }
        });

        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/orders
 * @desc    Get all orders for the logged-in user
 * @access  Private
 */
export const getUserOrders = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const orders = await Order.find({ user: userId })
            .sort({ createdAt: -1 }) // Newest first
            .populate('items.product', 'name price image_url');

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/orders/:orderId/qr-status
 * @desc    Check if QR code has been scanned for an order
 * @access  Private
 */
export const checkQrStatus = async (req, res, next) => {
    try {
        const order = await Order.findOne({ 
            order_id: req.params.orderId,
            user: req.user.id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: { qr_scanned: order.qr_scanned }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/orders/scan/:orderId
 * @desc    Public endpoint — hit when someone scans QR code
 * @access  Public (no auth required)
 */
export const handleQrScan = async (req, res, next) => {
    try {
        const order = await Order.findOne({ order_id: req.params.orderId });

        if (!order) {
            return res.status(404).send('<html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif"><h1>Order not found</h1></body></html>');
        }

        order.qr_scanned = true;
        await order.save();

        res.send(`
            <html>
            <head><meta name="viewport" content="width=device-width,initial-scale=1"></head>
            <body style="background:#020008;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui,sans-serif;margin:0">
                <div style="text-align:center;padding:2rem">
                    <div style="width:80px;height:80px;border-radius:50%;background:rgba(34,197,94,0.2);display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <h1 style="font-size:1.5rem;margin:0 0 0.5rem">Payment Received</h1>
                    <p style="color:#9ca3af;margin:0 0 1rem">Order ${order.order_id}</p>
                    <p style="color:#6b7280;font-size:0.875rem">You can close this page now.</p>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        next(error);
    }
};
