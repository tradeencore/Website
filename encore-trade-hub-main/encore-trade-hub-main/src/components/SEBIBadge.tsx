
import { Shield, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SEBIBadgeProps {
  variant?: 'default' | 'inline' | 'footer';
  showLink?: boolean;
}

const SEBIBadge = ({ variant = 'default', showLink = true }: SEBIBadgeProps) => {
  const registrationNumber = 'INH000009269';
  const certificationUrl = 'https://tradeencore.com/certifications/';

  if (variant === 'inline') {
    return (
      <div className="inline-flex items-center gap-2">
        <Shield className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">SEBI Reg: {registrationNumber}</span>
        {showLink && (
          <a 
            href={certificationUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className="text-center text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="w-4 h-4" />
          <span>SEBI Registered Research Analyst</span>
        </div>
        <p>Registration No: {registrationNumber}</p>
        {showLink && (
          <a 
            href={certificationUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1 mt-1"
          >
            Verify Registration <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  }

  return (
    <Badge variant="secondary" className="inline-flex items-center gap-2">
      <Shield className="w-4 h-4" />
      <span>SEBI Registered - {registrationNumber}</span>
      {showLink && (
        <a 
          href={certificationUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="ml-1 hover:text-primary"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </Badge>
  );
};

export default SEBIBadge;
