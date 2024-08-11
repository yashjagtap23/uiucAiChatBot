'use client';
import { Box, Stack, TextField, Button, Typography } from "@mui/material";
import zIndex from "@mui/material/styles/zIndex";
import { useState, useRef, useEffect } from "react";
// import { Inter } from "next/font/google";

// const inter = Inter({
//   subsets: ["latin"]
// });

export default function Home() {

  // State to manage the chat history
  const [history, setHistory] = useState([]);

  // Used for auto scrolling the chatlog
  const scrollRef = useRef(null)
  useEffect(() => {
    if (scrollRef.current){
      scrollRef.current.scrollIntoView({ behavior: 'smooth'});
    }
  }, [history])

  // Initial welcome message from the assistant
  const firstMessage = "Hi there! I'm the UIUC virtual assistant. How can I help?";

  // State to manage the current message input by the user
  const [message, setMessage] = useState("");

  // Function to convert markdown to HTML-like formatting
  const convertMarkdownToHtml = (text) => {
    // Convert **bold** to <strong>bold</strong>
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert \n to <br>
    formattedText = formattedText.replace(/\n/g, '<br>');
    
    // Convert italicized words -> does not work 100% of the time because gemini messes up the combined bold and italicized '*' formatting
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Remove excessive <br> tags at the end of the text
    formattedText = formattedText.replace(/(<br>\s*)+$/, '');
    return formattedText;
  };

  // Function to handle sending a message
  const sendMessage = async () => {
    // Add the user's message to the history
    setHistory((history) => [ ...history, { role: "user", parts: [{ text: message }] }]);
    // Clear the message input
    setMessage('');

    // Send the message to the server
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([ ...history, { role: "user", parts: [{ text: message }] }])
    });

    // Get the response data from the server
    const data = await response.json();

    // Convert the model's response to HTML
    const htmlText = convertMarkdownToHtml(data.message || data);
    setHistory((history) => [ ...history, { role: "model", parts: [{ text: htmlText }] }]);
  };

  return (
    <main>
      <div
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        width: '100%',
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        backgroundColor: '#a3e8ff'
      }}
      >
        <h1
        style={{
          fontSize: '2.25rem',
          padding: '1rem 0 0 0',
          textAlign: 'center',
          fontFamily: 'sans-serif'
        }}
        >uiucGPT
        </h1>
      </div>
      
      <Box
      width={'100%'}
      height={'100vh'}
      display={'flex'}
      justifyContent={'center'}
      // alignItems={'center'}
      bgcolor={'#a3e8ff'}
      >
        <Stack 
          direction={'column'} 
          justifyContent={'flex-end'}
          width={'50%'} 
          height={'72%'} 
          maxHeight={'72%'} 
          border={'1px solid #F5F5F5'} 
          borderRadius={5}
          mt={'4rem'}
          spacing={3}
          overflow='hidden'
          style={{
            boxShadow: 'rgba(0, 0, 0, 0.4) 0px 19px 38px, rgba(0, 0, 0, 0.1) 0px -7px 20px'
          }}
          bgcolor={'white'}
        >
          <Stack direction={'column'} spacing={2} overflow={'auto'} mb={2}
          sx={{
            scrollbarWidth: 'thin',
            scrollbarColor: ' #5E6669 #E8E9EA'
          }}
          >
            {/* Initial message from the assistant */}
            <Box
              display={'flex'}
              justifyContent={'flex-start'} // Align the initial message to the right
              px={1}
            >
              <Box
                bgcolor={'#1F4096'}
                borderRadius={5}
                p={2}
                mt={2}
                mb={1}
                maxWidth={'60%'} // Limit the width of the text bubble
                boxShadow={'-3px 5px 5px #3c59a3'}
              >
                <Typography color={'white'} >
                  {firstMessage}
                </Typography>
              </Box>
            </Box>

            {/* Render the chat history */}
            {history.map((textObject, index) => (
              <Box
                key={index}
                display={'flex'}
                justifyContent={textObject.role === 'user' ? 'flex-end' : 'flex-start'}
                paddingX={1}
                ref={scrollRef}
                margin={5}
              >
                <Box
                  bgcolor={textObject.role === 'user' ? '#ff5f05' : '#1F4096'}
                  color={'white'}
                  borderRadius={5}
                  p={2}
                  maxWidth={'60%'} // Limit the width of the text bubble
                  boxShadow={textObject.role === 'user' ? '3px 5px 5px #ff8540' : '-3px 5px 5px #3c59a3'}
                  mb={1}
                >
                  {/* Render HTML content */}
                  <Typography
                    dangerouslySetInnerHTML={{ __html: textObject.parts[0].text }}
                  />
                </Box>
              </Box>
            ))}
          </Stack>

          {/* Input field and send button */}
          <Stack direction={'row'} spacing={2} width={'98%'} display={'flex'} alignItems={'center'} justifyContent={'space-between'} pb={1} pl='4px' marginTop='4px'>
            
          <TextField 
          
              /* label='Message'*/
              value={message}
              placeholder="Message"
              onChange={(e => setMessage(e.target.value))}
              fullWidth
              pt={0}
              mt={0}
              sx={{ paddingLeft: '5px'}}
              onKeyDown={(k) => {
                if (k.key === 'Enter'){
                  sendMessage();
                }
              }}
            />
            <Button variant='contained'
            onClick={sendMessage}
            style={{
              minWidth: '75px',
              minHeight: '45px'
            }}
            >Send</Button>
          </Stack>
        </Stack>
    </Box>
    </main>
    
  );
}
