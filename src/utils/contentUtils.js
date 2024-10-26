import React from 'react';
import { Link } from 'react-router-dom';
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';

export const createGlossaryLink = (term) => {
  // Convert term to URL-friendly format
   const urlTerm = encodeURIComponent(term.toLowerCase());
   return `/glossary?term=${urlTerm}`;
};

export const richTextRenderOptions = {
   renderNode: {
      [BLOCKS.PARAGRAPH]: (node, children) => {
         if (children.length === 0) return null;
         return <p>{children}</p>;
      },
      [BLOCKS.HEADING_1]: (node, children) => <h1>{children}</h1>,
      [BLOCKS.HEADING_2]: (node, children) => <h2>{children}</h2>,
      [BLOCKS.HEADING_3]: (node, children) => <h3>{children}</h3>,
      [BLOCKS.UL_LIST]: (node, children) => <ul>{children}</ul>,
      [BLOCKS.OL_LIST]: (node, children) => <ol>{children.filter(child => child !== null)}</ol>,
      [BLOCKS.LIST_ITEM]: (node, children) => {
         if (children.length === 0 || (children.length === 1 && children[0] === null)) return null;
         const content = children.map(child => {
            if (typeof child === 'string') {
               return child.replace(/^\d+\.\s*/, '');
            }
            return child;
         });
         return <li>{content}</li>;
      },
      [INLINES.HYPERLINK]: (node, children) => {
         // Check if this is a glossary term link
         if (node.data.uri.startsWith('glossary://')) {
         const term = node.data.uri.replace('glossary://', '');
         return (
            <Link 
               to={createGlossaryLink(term)}
               className="text-blue-400 hover:text-blue-300 underline"
            >
               {children}
            </Link>
         );
         }
         // Regular external link
         return (
         <a 
            href={node.data.uri} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
         >
            {children}
         </a>
         );
      },
   },
   renderMark: {
      [MARKS.BOLD]: text => <strong>{text}</strong>,
      [MARKS.ITALIC]: text => <em>{text}</em>,
      [MARKS.UNDERLINE]: text => <u>{text}</u>,
   },
};