import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// Import the documents array (in a real app, this would be from a database)
// For now, we'll query the documents endpoint or check uploads directory
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Try to get document info from the upload directory
    // Files are stored as: document-{timestamp}-{random}.ext
    const uploadDir = path.join(process.cwd(), 'uploads', 'documents');
    
    if (!fs.existsSync(uploadDir)) {
      return NextResponse.json(
        { error: 'Upload directory not found' },
        { status: 404 }
      );
    }

    // List all files and find the one that might match this document ID
    // In a real implementation, you'd store the filename in the document metadata
    const files = fs.readdirSync(uploadDir);
    const file = files.find(f => f.includes(params.id) || f.startsWith('document-'));

    if (!file) {
      // Try fetching document metadata from API
      try {
        const documentsResponse = await fetch(`${request.nextUrl.origin}/api/documents`);
        const documents = await documentsResponse.json();
        const document = documents.find((doc: any) => doc.id === params.id);
        
        if (document?.fileName) {
          const filePath = path.join(uploadDir, document.fileName);
          if (fs.existsSync(filePath)) {
            const fileBuffer = fs.readFileSync(filePath);
            const fileExtension = path.extname(document.fileName).toLowerCase();
            const contentTypeMap: { [key: string]: string } = {
              '.pdf': 'application/pdf',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.png': 'image/png',
              '.txt': 'text/plain',
            };
            const contentType = contentTypeMap[fileExtension] || 'application/octet-stream';
            
            return new NextResponse(fileBuffer, {
              headers: {
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${document.fileName}"`,
              },
            });
          }
        }
      } catch (fetchError) {
        // Continue to next fallback
      }
      
      return NextResponse.json(
        { error: 'Document file not found' },
        { status: 404 }
      );
    }

    // Construct file path
    const filePath = path.join(uploadDir, file);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found on server' },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    const fileExtension = path.extname(file).toLowerCase();

    // Determine content type based on file extension
    const contentTypeMap: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.txt': 'text/plain',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    const contentType = contentTypeMap[fileExtension] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${file}"`,
      },
    });
  } catch (error) {
    console.error('Error retrieving document file:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve document file' },
      { status: 500 }
    );
  }
}
