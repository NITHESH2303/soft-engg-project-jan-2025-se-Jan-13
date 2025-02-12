interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = true }: CardProps) {
  return (
    <div 
      className={`
        glass-morphism rounded-xl p-6
        ${hover ? 'hover-lift hover-glow' : ''}
        animate-scale-in
        ${className}
      `}
    >
      {children}
    </div>
  );
}