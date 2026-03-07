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

        res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>VibeSpace Payment</title>
    <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:#020008;color:#fff;font-family:system-ui,-apple-system,sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem}
        .brand{font-size:1.25rem;font-weight:800;margin-bottom:2rem;opacity:0.7}
        .brand span{color:#8400ff}
        .card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:2.5rem 2rem;text-align:center;width:100%;max-width:360px}
        .icon-wrap{width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem}
        .spinner-wrap{background:rgba(0,212,255,0.1)}
        .success-wrap{background:rgba(34,197,94,0.15);animation:pop .4s ease-out}
        .spinner{width:40px;height:40px;border:3px solid rgba(0,212,255,0.2);border-top-color:#00d4ff;border-radius:50%;animation:spin 1s linear infinite}
        h2{font-size:1.5rem;font-weight:700;margin-bottom:.5rem}
        .sub{color:#9ca3af;font-size:.875rem;margin-bottom:1.5rem}
        .order-row{display:flex;justify-content:space-between;padding:.75rem 0;border-top:1px solid rgba(255,255,255,0.06);font-size:.85rem}
        .order-row:first-child{border-top:none}
        .label{color:#6b7280}
        .value{font-weight:600}
        .amount{color:#00d4ff;font-size:1.1rem;font-weight:700}
        .badge{display:inline-block;background:rgba(132,0,255,0.15);color:#c084fc;padding:.15rem .75rem;border-radius:999px;font-size:.7rem;font-weight:700;margin-top:.75rem}
        .close-msg{color:#6b7280;font-size:.75rem;margin-top:1.5rem}
        #verifying{display:block}
        #confirmed{display:none}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
    </style>
</head>
<body>
    <div class="brand"><span>Vibe</span>Space Pay</div>
    <div class="card">
        <div id="verifying">
            <div class="icon-wrap spinner-wrap"><div class="spinner"></div></div>
            <h2>Verifying Payment</h2>
            <p class="sub">Confirming with VibeSpace...</p>
        </div>
        <div id="confirmed">
            <div class="icon-wrap success-wrap">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round"><path d="M5 13l4 4L19 7"/></svg>
            </div>
            <h2>Payment Received!</h2>
            <p class="sub">Your payment has been confirmed</p>
            <div>
                <div class="order-row"><span class="label">Order</span><span class="value">${order.order_id}</span></div>
                <div class="order-row"><span class="label">Amount</span><span class="amount">$${order.total_amount?.toFixed(2) || '0.00'}</span></div>
                <div class="order-row"><span class="label">Merchant</span><span class="value">VibeSpace</span></div>
            </div>
            <div class="badge">✓ Payment Confirmed</div>
        </div>
    </div>
    <p class="close-msg" id="closeMsg"></p>
    <script>
        setTimeout(function(){
            document.getElementById('verifying').style.display='none';
            document.getElementById('confirmed').style.display='block';
            document.getElementById('closeMsg').textContent='You can close this page now';
        }, 3000);
    </script>
</body>
</html>`);
    } catch (error) {
        next(error);
    }
};
