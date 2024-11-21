import express from 'express';
import cors from 'cors';
import cricketRoutes from './routes/cricket';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', cricketRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});