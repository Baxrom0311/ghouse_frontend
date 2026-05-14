import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-4"
      >
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center"
        >
          <Leaf className="w-10 h-10 text-primary" />
        </motion.div>
        <h1 className="font-display text-7xl font-bold text-primary glow-text mb-2">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Sahifa topilmadi
        </p>
        <Link to="/">
          <Button variant="neon" size="lg">
            <Home className="w-5 h-5 mr-2" />
            Bosh sahifaga qaytish
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
