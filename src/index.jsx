import * as React from 'react';
import jsonData from './input.json';
import ReactDOM from 'react-dom/client';

/* Plan :
Parent component = Agreement
In each other object, we have title, type, adn children. Type denotes the component types (h1, block, p, mention, text, clause, ul, li, h4, lic...).
The component types that I don't know are block, mention, text ,clause, and lic, so these will be new components.
Also in the heading we have various other info like styling.
In the final part we have text.

Children components = 
    Blocks, clauses, mentions, lic, and text.

We want to map through the input.json structure. Each time we check the type and add in the relevant styling, then continue through until all partsa re mapped.
We also want to create necessary children and render them when finished.

We will probably pass in children inside wahtever element/component we are creating, and the rest of the info is immediately applciable.

Other info :
    clauses can be kept track of using useRef as it doesn't explicitly change the view or trigger re-renders, increment the counter each time it's called to maintain the numbering system.
    Mentions should take in their data as a prop, then use that to render the component. They need to re-render on changing one with the associated ID.
    As a result, they should defniitely useState to keep track of data, so maybe an object of id : content pairs for all the mentions.
    Clauses have no styling, mentions only have colour styling.
*/

function Mention({marks,mentions,id,color}){
    return(
        <span style={{fontWeight:marks.fontWeight, fontStyle:marks.fontStyle, textDecoration:marks.textDecoration, backgroundColor:color}}>{mentions[id]}</span>
    )
};

function Clause({marks,index,children}){
    return(
        // cuz of backtracking we've got the children, so we just need the first bullet point and styling.
        <ol style={{fontWeight:marks.fontWeight, fontStyle:marks.fontStyle, textDecoration:marks.textDecoration}}>
            {index}.
            <div>{children}</div>
        </ol>  
        // ik it says doesn't behave necessarily like an <ol>, but I'm not sure how to do it otherwise.
        // also not sure how to format the index -> children part
    )
}

export default function Agreement(){
    // function should map through all of the objects.
    // Create a variable to hold all of the styles, then add them to the relevant elements.
    // Check for type, add to relevant component/element, recursively call function on the children if there are any
    // Also, add in props for styling and other relevant info.
    // Base case is when there are no children (text exists as a key in the object), then we just render the text with styling.
    
    // decalare ref to keep track of clauses
    const clauseIndex = React.useRef(0); // start at 0, incremenet before each Clause call, so first clause is 1.
    const [mentions,setMentions] = React.useState({}) // initial state is empty object. Will be filled over time.
    const data = jsonData;

    const backtrack = (items) => {
        if (Array.isArray(items)) { // if item is an array (inside the children element or initial element) go thru each object.
            return items.map((item) => backtrack(item));
        }
        const marks = {   // object that'll hold the optional marks. Check if they're true, then add them to the style.
            fontWeight: items.bold ? 'bold' : 'normal',
            fontStyle: items.italic ? 'italic' : 'normal',
            textDecoration: items.underline ? 'underline' : 'none',
        };
        
        if (items.type === "mention"){
            const newMentions = {...mentions};  // add to state of all the mentions.... pass thru state for re-rendering when necessary
            newMentions[items.title] = items.children[0].text;
            setMentions(newMentions);
            return <Mention marks={marks} mentions={mentions} color={items.color} id={items.title}/> // passing prop leads to re-render when necessary.
            // shouldnt need other styling, no other besides color in json, but just in case.
        }
        else if (items.type === "clause"){
            clauseIndex.current += 1;   // increment clause index.
            return <Clause marks={marks} index={clauseIndex.current}>{items.children && backtrack(items.children)}</Clause>
        }
        else if (items.type==="text"){  // the base case, should stop here.
            return <span style={{fontWeight:marks.fontWeight, fontStyle:marks.fontStyle, textDecoration:marks.textDecoration}}>{items.text}</span> 
            // should probably be returning without span tag cuz might lead to span nests, but seems helpful for indiviudal styling...
        }
        else{
            const Tag = items.type === 'lic' ? 'span' : items.type; // replace 'lic' with 'span' cuz it seems to just be text.
            return (
              <Tag style={{fontWeight:marks.fontWeight, fontStyle:marks.fontStyle, textDecoration:marks.textDecoration}}>
                {items.children && backtrack(items.children)}
              </Tag>
            );
        }
        
    }
    
    return <main className="agreement">{backtrack(data[0])}</main>;
};

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(<Agreement/>);