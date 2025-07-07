export const formatLogDetails = (details: any, action: string) => {
  if (!details) return null;

  // Handle user invitation actions
  if (action.toLowerCase().includes('gebruiker uitgenodigd')) {
    if (details.invited_email) {
      return `E-mailadres: ${details.invited_email}`;
    }
    if (details.email) {
      return `E-mailadres: ${details.email}`;
    }
    if (details.user_email) {
      return `E-mailadres: ${details.user_email}`;
    }
    return 'Uitnodiging verzonden';
  }

  // Handle invitation cancellation actions - prioritize finding email addresses
  if (action.toLowerCase().includes('uitnodiging geannuleerd')) {
    // First try the enriched email field
    if (details.invited_email && typeof details.invited_email === 'string') {
      if (details.invited_email.includes('@')) {
        return `E-mailadres: ${details.invited_email}`;
      } else if (details.invited_email.includes('uitnodigingen')) {
        return details.invited_email; // This will show "X uitnodigingen"
      }
    }
    
    // Then try other standard email fields
    if (details.email && typeof details.email === 'string' && details.email.includes('@')) {
      return `E-mailadres: ${details.email}`;
    }
    if (details.user_email && typeof details.user_email === 'string' && details.user_email.includes('@')) {
      return `E-mailadres: ${details.user_email}`;
    }
    
    // Check if email is stored in nested invitation data
    if (details.invitation_data?.email && typeof details.invitation_data.email === 'string' && details.invitation_data.email.includes('@')) {
      return `E-mailadres: ${details.invitation_data.email}`;
    }
    
    // Recursively search through all properties for email addresses
    if (typeof details === 'object' && details !== null) {
      const findEmailInObject = (obj: any): string | null => {
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'string' && value.includes('@') && value.includes('.') && value.length > 5) {
            return value;
          }
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            const nestedEmail = findEmailInObject(value);
            if (nestedEmail) return nestedEmail;
          }
        }
        return null;
      };
      
      const foundEmail = findEmailInObject(details);
      if (foundEmail) {
        return `E-mailadres: ${foundEmail}`;
      }
    }
    
    // If no email found, provide better fallback information
    if (details.invitation_id) {
      return `Uitnodiging verwijderd (ID: ${details.invitation_id.slice(0, 8)}...)`;
    }
    if (details.invitation_ids && Array.isArray(details.invitation_ids)) {
      return `${details.invitation_ids.length} uitnodiging(en) verwijderd`;
    }
    
    return 'Uitnodiging verwijderd (e-mailadres onbekend)';
  }

  // Handle other invitation actions (general)
  if (action.toLowerCase().includes('uitnodiging')) {
    if (details.email) {
      return `E-mailadres: ${details.email}`;
    }
    if (details.invited_email) {
      return `E-mailadres: ${details.invited_email}`;
    }
    if (details.user_email) {
      return `E-mailadres: ${details.user_email}`;
    }
    if (details.invitation_ids && Array.isArray(details.invitation_ids)) {
      return `${details.invitation_ids.length} uitnodiging(en) verwerkt`;
    }
    return 'Uitnodiging verwerkt';
  }

  // Handle user role changes
  if (action.toLowerCase().includes('gebruiker uitgenodigd') === false && action.toLowerCase().includes('gebruiker')) {
    if (details.user_email) {
      return `Betreft gebruiker: ${details.user_email}`;
    }
    if (details.user_name) {
      return `Betreft gebruiker: ${details.user_name}`;
    }
    if (details.email) {
      return `Betreft gebruiker: ${details.email}`;
    }
    // Handle role changes specifically
    if (details.role) {
      return `Nieuwe rol: gebruiker`;
    }
  }

  // Handle organization actions
  if (action.toLowerCase().includes('organisatie')) {
    if (details.organization_name) {
      return `Organisatie: ${details.organization_name}`;
    }
    if (details.name) {
      return `Organisatie: ${details.name}`;
    }
  }

  // Handle workspace actions
  if (action.toLowerCase().includes('werkruimte')) {
    if (details.workspace_name) {
      return `Werkruimte: ${details.workspace_name}`;
    }
    if (details.name) {
      return `Werkruimte: ${details.name}`;
    }
  }

  // Handle document actions
  if (action.toLowerCase().includes('document')) {
    if (details.document_name) {
      return `Document: ${details.document_name}`;
    }
    if (details.file_name) {
      return `Bestand: ${details.file_name}`;
    }
    if (details.name) {
      return `Document: ${details.name}`;
    }
  }

  // Handle login/logout
  if (action.toLowerCase().includes('login') || action.toLowerCase().includes('ingelogd')) {
    return 'Gebruiker heeft ingelogd';
  }

  if (action.toLowerCase().includes('logout') || action.toLowerCase().includes('uitgelogd')) {
    return 'Gebruiker heeft uitgelogd';
  }

  // Handle profile updates
  if (action.toLowerCase().includes('profiel')) {
    if (details.email) {
      return `Profiel bijgewerkt voor: ${details.email}`;
    }
    if (details.target_user_id) {
      return 'Profiel bijgewerkt';
    }
    return 'Profiel bijgewerkt';
  }

  // Generic handling for objects with meaningful data
  if (typeof details === 'object' && details !== null) {
    const keys = Object.keys(details);
    
    // Look for email addresses first (most important for invitations)
    if (details.email) return `E-mail: ${details.email}`;
    if (details.invited_email) return `E-mailadres: ${details.invited_email}`;
    if (details.user_email) return `E-mailadres: ${details.user_email}`;
    
    // Look for other meaningful fields
    if (details.name) return `Naam: ${details.name}`;
    if (details.title) return `Titel: ${details.title}`;
    if (details.role) {
      return `Rol: gebruiker`;
    }
    
    // If it's just IDs or technical data, show a generic message
    if (keys.length > 0 && keys.every(key => key.includes('_id') || key.includes('id'))) {
      return 'Systeem actie uitgevoerd';
    }

    // If we have any meaningful content, try to show something useful
    if (keys.length > 0) {
      // Look for any field that might contain useful information
      for (const key of keys) {
        if (details[key] && typeof details[key] === 'string' && !key.includes('id')) {
          return `${key}: ${details[key]}`;
        }
      }
    }
  }

  return null;
};
