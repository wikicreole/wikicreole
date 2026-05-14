/*	creole.c (Warning: This file generated from creole.rl with the Ragel State Machine Compiler!)

	Command line tool to parse Creole input and output XHTML
	Copyright (C) 2007  Mark Wharton contact@moonbase.com.au

	This program is free software; you can redistribute it and/or
	modify it under the terms of the GNU General Public License
	as published by the Free Software Foundation; either version 2
	of the License, or (at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program; if not, write to the Free Software
	Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/

/*
	Wiki Creole
	http://www.wikicreole.org/wiki/Home
	http://www.wikicreole.org/wiki/MarkWharton

	Ragel State Machine Compiler
	http://www.cs.queensu.ca/~thurston/ragel/
	http://www.cs.queensu.ca/~thurston/ragel/ragel-5.20-w32bin.zip
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/*
	The largest character expansion while building strings is where quote (") becomes &quot;
	The string size should be six times the buffer size to accomodate a worst case scenerio where
	{{"""""""" (i.e. quote (") repeats for buffer size - 3 times) fills an entire line of buffer size.
*/

#define BUFFERSIZE 8192
#define STRINGSIZE BUFFERSIZE*6

/**********************
 ** Line Definitions **
 **********************/

#define kCreoleMask              0x07
#define kCreoleModifier          0x08
#define kCreoleModifierMask      0x0F

#define kCreoleDefault           0x00

#define kCreoleHeading           0x10
#define kCreoleHeading1          0x11
#define kCreoleHeading2          0x12
#define kCreoleHeading3          0x13
#define kCreoleHeading4          0x14
#define kCreoleHeading5          0x15
#define kCreoleHeading6          0x16

#define kCreoleHorizontalRule    0x20

#define kCreoleList              0x30
#define kCreoleList1             0x31
#define kCreoleList2             0x32
#define kCreoleList3             0x33
#define kCreoleList4             0x34
#define kCreoleList5             0x35
#define kCreoleListOL            0x30 /* standard */
#define kCreoleListOL1           0x31 /* etc. */
#define kCreoleListOL2           0x32
#define kCreoleListOL3           0x33
#define kCreoleListOL4           0x34
#define kCreoleListOL5           0x35
#define kCreoleListUL            0x38 /* modified */
#define kCreoleListUL1           0x39 /* etc. */
#define kCreoleListUL2           0x3A
#define kCreoleListUL3           0x3B
#define kCreoleListUL4           0x3C
#define kCreoleListUL5           0x3D

#define kCreoleParagraph         0x40

#define kCreolePlaceholder       0x50

#define kCreolePreformatted      0x60 /* standard */
#define kCreolePreformattedBegin 0x68 /* modified */
#define kCreolePreformattedEnd   0x70

#define kCreoleTableData         0x80

/***********************
 ** Macro Definitions **
 ***********************/

#define BASE 0
#define ECHO(P) printf(P)
#define ECHO1(P, A) printf(P, A)
#define ECHO2(P, A, B) printf(P, A, B)
#define ECHO3(P, A, B, C) printf(P, A, B, C)
#define ECHOSTACK(S, T) while (T>0) printf(S[--T])
#define ECHOSTACKBASE(S, T, L) while (T>BASE+(L)) printf(S[--T])
#define ECHOTEXT(P, PE) fwrite(P, 1, PE - P, stdout)
#define ECHOTEXTSIZE(P, S) fwrite(P, 1, S, stdout)
#define POPSTACK(S, T) S[--T]
#define PUSHSTACK(S, T, P) S[T++] = P

/**********************
 ** Type Definitions **
 **********************/

typedef struct creoleState creoleState;
typedef int (*parse_cb)(char *buffer, int size, creoleState *state, int cs);
typedef void (*state_cb)(creoleState *state);

typedef struct creoleStack {
	char *stack[10];
	int top;
} creoleStack;

typedef struct creoleWait {
	int image;
	int link;
	int nowiki;
	int placeholder;
} creoleWait;

typedef struct creoleState {

	/* parser */

	parse_cb parseExec;
	int en_heading;
	int en_line;

	/* command line options */

	int escape;
	int escmax; /* not used */
	int linebr;

	/* variables etc. */

	char punctuation;

	int linecount;
	int splitable;

	char *buffer;
	char *string;

	char *start;
	char *stop;

	int curr; /* current line type */
	int prev; /* previous line type */

	creoleStack main; /* 0 = root, 1 = level 1, 2 = level 2, 3 = level 3, 4 = level 4, 5 = level 5 */
	creoleStack exec; /* 0 = tablemarker, 1 = bold, 2 = italic, 3 = monospace, 4 = link/image etc. */
	creoleStack line; /* 0 = link/image etc. to make sure line is cleaned up properly when leaving */

	creoleWait wait;

	/* state */

	int bold;
	int italics;
	int monospace;
	int tablemarker;

	/* machine */

	int cs;
	int stack[10];
	int top;

} creoleState;

/*******************************************
 ** String Builder XHTML Escape Functions **
 *******************************************/

void strChar(char **str, char fc, int quotes)
{
	if (quotes) {
		switch (fc) {
		case '"':
			*(*str)++ = '&';
			*(*str)++ = 'q';
			*(*str)++ = 'u';
			*(*str)++ = 'o';
			*(*str)++ = 't';
			*(*str)++ = ';';
			break;
		default:
			*(*str)++ = fc;
			break;
		}
	}
	else {
		switch (fc) {
		case '<':
			*(*str)++ = '&';
			*(*str)++ = 'l';
			*(*str)++ = 't';
			*(*str)++ = ';';
			break;
		case '>':
			*(*str)++ = '&';
			*(*str)++ = 'g';
			*(*str)++ = 't';
			*(*str)++ = ';';
			break;
		case '&':
			*(*str)++ = '&';
			*(*str)++ = 'a';
			*(*str)++ = 'm';
			*(*str)++ = 'p';
			*(*str)++ = ';';
			break;
		default:
			*(*str)++ = fc;
			break;
		}
	}
}

void strCharRepeat(char **str, char fc, int quotes, int count)
{
	if (count > 0) {
		while (count--) {
			strChar(str, fc, quotes);
		}
	}
}

void strEnd(char **str)
{
	*(*str)++ = '\0'; /* C string terminator */
}

void strString(char **str, char *fpc, int quotes)
{
	while (*fpc) {
		strChar(str, *fpc++, quotes);
	}
}

/*****************************
 ** Creole Test State Chart **
 *****************************/

/*
	Test bed for command line options and basic structure, and for building up new features.
*/

%%{

	machine creoleTestStateChart;
	access state->;

	action emit { strChar(&str, fc, 0); }
	action emit_escape { if (state->escape) strChar(&str, fc, 0); else { strChar(&str, '~', 0); fhold; } }
	action emit_normal { strChar(&str, '~', 0); fhold; } #// emit_escape or emit_normal
	action emit_quotes { strChar(&str, fc, 1); }

	action do_exit { strEnd(&str); str = state->string; fbreak; }
	action do_line { strEnd(&str); ECHO(state->string); str = state->string; ECHOSTACK(state->line.stack, state->line.top); if (state->linebr && (p - b > 0)) { ECHO("<br />"); } fbreak; }
	action do_null { strEnd(&str); ECHO(state->string); str = state->string; ECHOSTACK(state->line.stack, state->line.top); fbreak; } #// Special action for parsing C strings.

	action do_forcedlinebreak { strEnd(&str); ECHO(state->string); str = state->string; ECHO("<br />"); }

	creole =
	start: (
		[~] -> escape | 
		[\n] @do_line -> final | 
		[\0] @do_null -> final | 
		[\\] -> forcedlinebreak | 
		[^~\n\0\\] @emit -> start
	),
	escape: (
		[\t 0-9A-Za-z] @emit_normal -> start | [^\t 0-9A-Za-z] @emit_escape -> start
	),
	forcedlinebreak: (
		[\\] @do_forcedlinebreak -> start | [^\\] @{ strChar(&str, '\\', 0); fhold; } -> start
	);

	heading :=
	start: (
		[~] -> escape | [\n] @do_line -> final | [\0] @do_null -> final | [=] -> start | [^~\n\0=] @emit -> start
	),
	escape: (
		[\t 0-9A-Za-z] @emit_normal -> start | [^\t 0-9A-Za-z] @emit_escape -> start
	);

	line :=
	start: (
		[\n\0] @do_exit -> start | [\t] @{ strString(&str, "    ", 0); } -> start | [^\n\0\t] @emit -> start #// Note: @do_exit -> start should be -> final but no final state is implicitly created!
	);

	main := creole;

}%%

%% write data noerror nofinal;

int creoleTestParseExec(char *buffer, int size, creoleState *state, int cs)
{
	char *str = state->string; /* string builder */

	char *b = buffer, *p = buffer;
	char *pe = p + size;

	state->cs = cs;

	%% write exec;

	return p - b;
}

void creoleTestParseFree(creoleState *state)
{
	if (state->buffer) {
		free(state->buffer);
		state->buffer = NULL;
	}
	if (state->string) {
		free(state->string);
		state->string = NULL;
	}
}

void creoleTestParseInit(creoleState *state)
{
	memset(state, 0, sizeof(creoleState));
	state->string = malloc(STRINGSIZE);
	if (state->string) {
		state->buffer = malloc(BUFFERSIZE);
		if (state->buffer) {
		}
	}
	state->en_heading = creoleTestStateChart_en_heading;
	state->en_line = creoleTestStateChart_en_line;

	%% write init;
}

/************************
 ** Creole State Chart **
 ************************/

/*
	Parse Creole input and ouput XHTML.
*/

%%{

	machine creoleStateChart;
	access state->;

	action emit { strChar(&str, fc, 0); }
	action emit_escape { if (state->escape) strChar(&str, fc, 0); else { strChar(&str, '~', 0); fhold; } }
	action emit_normal { strChar(&str, '~', 0); fhold; } #// emit_escape or emit_normal
	action emit_quotes { strChar(&str, fc, 1); }

	action do_exit { strEnd(&str); str = state->string; fbreak; }
	action do_line { strEnd(&str); ECHO(state->string); str = state->string; ECHOSTACK(state->line.stack, state->line.top); if (state->linebr && (p - b > 0)) { ECHO("<br />"); } fbreak; }
	action do_null { strEnd(&str); ECHO(state->string); str = state->string; ECHOSTACK(state->line.stack, state->line.top); fbreak; } #// Special action for parsing C strings.

	action do_forcedlinebreak { strEnd(&str); ECHO(state->string); str = state->string; ECHO("<br />"); }

	#// emphasis actions

	action do_bold_toggle { strEnd(&str); ECHO(state->string); str = state->string; state->bold = state->bold ? 0 : 1; if (state->bold) { ECHO("<strong>"); PUSHSTACK(state->exec.stack, state->exec.top, "</strong>"); } else ECHO(POPSTACK(state->exec.stack, state->exec.top)); }
	action do_italics_toggle { strEnd(&str); ECHO(state->string); str = state->string; state->italics = state->italics ? 0 : 1; if (state->italics) { ECHO("<em>"); PUSHSTACK(state->exec.stack, state->exec.top, "</em>"); } else ECHO(POPSTACK(state->exec.stack, state->exec.top)); }
	action do_monospace_toggle { strEnd(&str); ECHO(state->string); str = state->string; state->monospace = state->monospace ? 0 : 1; if (state->monospace) { ECHO("<tt>"); PUSHSTACK(state->exec.stack, state->exec.top, "</tt>"); } else ECHO(POPSTACK(state->exec.stack, state->exec.top)); }

	#// freelink actions

	action do_freelink { strEnd(&str); ECHO2("<a href=\"%s\">%s</a>", state->string, state->string); str = state->string; fhold; }
	action do_ftp_setup { strEnd(&str); ECHO(state->string); str = state->string; strString(&str, "ftp:", 0); }
	action do_http_setup { strEnd(&str); ECHO(state->string); str = state->string; strString(&str, "http:", 0); }

	#// other actions

	action do_link { strEnd(&str); ECHO(state->string); str = state->string; ECHO("<a href=\""); PUSHSTACK(state->line.stack, state->line.top, "\">?</a>"); state->wait.link = 0; }
	action do_link_end { strEnd(&str); ECHO(state->string); POPSTACK(state->line.stack, state->line.top); ECHO("\">"); ECHO(state->string); str = state->string; ECHO("</a>"); }
	action do_link_text { strEnd(&str); ECHO(state->string); str = state->string; POPSTACK(state->line.stack, state->line.top); ECHO("\">"); PUSHSTACK(state->line.stack, state->line.top, "</a>"); }
	action do_link_text_end { strEnd(&str); ECHO(state->string); str = state->string; ECHO(POPSTACK(state->line.stack, state->line.top)); }

	action do_image { strEnd(&str); ECHO(state->string); str = state->string; ECHO("<img src=\""); PUSHSTACK(state->line.stack, state->line.top, "\" />"); state->splitable = 1; state->wait.image = 0; }
	action do_image_end { strEnd(&str); ECHO(state->string); str = state->string; ECHO(POPSTACK(state->line.stack, state->line.top)); }
	action do_image_split { if (state->splitable) { strEnd(&str); ECHO(state->string); str = state->string; ECHO("\" title=\""); } else { strChar(&str, fc, 0); state->splitable = 0; } }

	action do_nowiki { strEnd(&str); ECHO(state->string); str = state->string; ECHO("<span class=\"creole-nowiki\">"); PUSHSTACK(state->line.stack, state->line.top, "</span>"); state->wait.nowiki = 0; }
	action do_nowiki_end { strEnd(&str); ECHO(state->string); str = state->string; ECHO(POPSTACK(state->line.stack, state->line.top)); }

	action do_placeholder { strEnd(&str); ECHO(state->string); str = state->string; ECHO("<!--"); PUSHSTACK(state->line.stack, state->line.top, "-->"); state->wait.placeholder = 0; }
	action do_placeholder_end { strEnd(&str); ECHO(state->string); str = state->string; ECHO(POPSTACK(state->line.stack, state->line.top)); }

	action do_table_data { strEnd(&str); ECHO(state->string); str = state->string; if ((fc != '\n') && (fc != '\0')) { if (state->tablemarker) { state->bold = state->italics = state->monospace = 0; ECHOSTACK(state->exec.stack, state->exec.top); ECHO("<td>"); PUSHSTACK(state->exec.stack, state->exec.top, "</td>"); } else strString(&str, "|"/*fc*/, 0)/*ECHO("|=")*/; } }
	action do_table_header { strEnd(&str); ECHO(state->string); str = state->string; if (state->tablemarker) { state->bold = state->italics = state->monospace = 0; ECHOSTACK(state->exec.stack, state->exec.top); ECHO("<th>"); PUSHSTACK(state->exec.stack, state->exec.top, "</th>"); } else strString(&str, "|="/*fc*/, 0)/*ECHO("|=")*/; }

	creole =
	start: (
		[~] -> escape | 
		[\n] @do_line -> final | 
		[\0] @do_null -> final | 
		[\\] -> forcedlinebreak | 

		#// emphasis characters

		[*] -> bold | 
		[/] -> italics | 
		[#] -> monospace | 

		#// freelink characters

		[f] -> ftp | 
		[h] -> http | 

		#// other characters

		[\[] -> link | 
		[{] -> nowiki_or_image | 
		[<] -> placeholder | 
		[|] -> table | 

		#// remaining characters

		[^~\n\0\\*/#fh\[{<|] @emit -> start
	),
	escape: (
		[\t 0-9A-Za-z] @emit_normal -> start | [^\t 0-9A-Za-z] @emit_escape -> start
	),
	forcedlinebreak: (
		[\\] @do_forcedlinebreak -> start | [^\\] @{ strChar(&str, '\\', 0); fhold; } -> start
	),

	#// emphasis states

	bold: (
		[*] @do_bold_toggle -> start | [^*] @{ strChar(&str, '*', 0); fhold; } -> start
	),
	italics: (
		[/] @do_italics_toggle -> start | [^/] @{ strChar(&str, '/', 0); fhold; } -> start
	),
	monospace: (
		[#] @do_monospace_toggle -> start | [^#] @{ strChar(&str, '#', 0); fhold; } -> start
	),

	#// freelink states

	ftp: (
		[t] -> ftp2 | [^t] @{ strString(&str, "f", 0); fhold; } -> start ), ftp2: (
		[p] -> ftp3 | [^p] @{ strString(&str, "ft", 0); fhold; } -> start ), ftp3: (
		[:] @do_ftp_setup -> freelink | [^:] @{ strString(&str, "ftp", 0); fhold; } -> start
	), 
	http: (
		[t] -> http2 | [^t] @{ strString(&str, "h", 0); fhold; } -> start ), http2: (
		[t] -> http3 | [^t] @{ strString(&str, "ht", 0); fhold; } -> start ), http3: (
		[p] -> http4 | [^p] @{ strString(&str, "htt", 0); fhold; } -> start ), http4: (
		[:] @do_http_setup -> freelink | [^:] @{ strString(&str, "http", 0); fhold; } -> start
	), 
	freelink: (
		[\n\0\t ] @do_freelink -> start | [,.?!:;'"] @{ state->punctuation = fc; } -> freelink_punctuation | [^\n\0\t ,.?!:;'"] @emit -> freelink
	), 
	freelink_punctuation: (
		[\n\0\t ] @do_freelink @{ strChar(&str, state->punctuation, 0); } -> start | [^\n\0\t ] @{ strChar(&str, state->punctuation, 0); } @emit -> freelink
	),

	#// other states

	link: (
		[\[] @do_link -> link_start | [^\[] @{ strChar(&str, '[', 0); fhold; } -> start
	),
	nowiki_or_image: (
		[{] -> nowiki | [^{] @{ strChar(&str, '{', 0); fhold; } -> start
	),
	nowiki: (
		[{] @do_nowiki -> nowiki_start | [^{] @do_image @{ fhold; } -> image_start #// Note: fhold required after do_image because failed {{{ test.
	),
	placeholder: (
		[<] @do_placeholder -> placeholder_start | [^<] @{ strChar(&str, '<', 0); fhold; } -> start
	),
	table: (
		[=] @do_table_header -> start | [^=] @do_table_data @{ fhold; } -> start #// Note: fhold required after do_table_data because failed |= test.
	),

	#// link...

	link_start: (
		[\n] @do_line -> final | [\0] @do_null -> final | [|] @do_link_text -> link_text_start | [\]] -> link_stop | [^\n\0|\]] @emit_quotes -> link_start
	),
	link_stop: (
		[\]] -> link_wait | [^\]] @{ strChar(&str, ']', 0); fhold; } -> link_start
	),
	link_wait: (
		[\]] @{ state->wait.link += 1; } -> link_wait | [^\]] @{ strCharRepeat(&str, ']', 0, state->wait.link); fhold; } @do_link_end -> start
	),
	link_text_start: (
		[\n] @do_line -> final | [\0] @do_null -> final | [{] -> link_text_image | [\]] -> link_text_stop | [^\n\0{\]] @emit -> link_text_start #// do not emit_quotes
	),
	link_text_stop: (
		[\]] -> link_text_wait | [^\]] @{ strChar(&str, ']', 0); fhold; } -> link_text_start
	),
	link_text_wait: (
		[\]] @{ state->wait.link += 1; } -> link_text_wait | [^\]] @{ strCharRepeat(&str, ']', 0, state->wait.link); fhold; } @do_link_text_end -> start
	),
	link_text_image: (
		[{] @do_image -> link_text_image_start | [^{] @{ strChar(&str, '{', 0); fhold; } -> link_text_start
	),
	link_text_image_start: (
		[\n] @do_line -> final | [\0] @do_null -> final | [|] @do_image_split -> link_text_image_start | [}] -> link_text_image_stop | [^\n\0|}] @emit_quotes -> link_text_image_start
	),
	link_text_image_stop: (
		[}] -> link_text_image_wait | [^}] @{ strChar(&str, '}', 0); fhold; } -> link_text_image_start
	),
	link_text_image_wait: (
		[}] @{ state->wait.image += 1; } -> link_text_image_wait | [^}] @{ strCharRepeat(&str, '}', 0, state->wait.image); fhold; } @do_image_end -> link_text_start
	),

	#// image...

	image_start: (
		[\n] @do_line -> final | [\0] @do_null -> final | [|] @do_image_split -> image_start | [}] -> image_stop | [^\n\0|}] @emit_quotes -> image_start
	),
	image_stop: (
		[}] -> image_wait | [^}] @{ strChar(&str, '}', 0); fhold; } -> image_start
	),
	image_wait: (
		[}] @{ state->wait.image += 1; } -> image_wait | [^}] @{ strCharRepeat(&str, '}', 0, state->wait.image); fhold; } @do_image_end -> start
	),

	#// nowiki...

	nowiki_start: (
		[\n] @do_line -> final | [\0] @do_null -> final | [}] -> nowiki_stop1 | [^\n\0}] @emit -> nowiki_start
	),
	nowiki_stop1: (
		[}] -> nowiki_stop2 | [^}] @{ strString(&str, "}", 0); fhold; } -> nowiki_start
	),
	nowiki_stop2: (
		[}] -> nowiki_wait | [^}] @{ strString(&str, "}}", 0); fhold; } -> nowiki_start
	),
	nowiki_wait: (
		[}] @{ state->wait.nowiki += 1; } -> nowiki_wait | [^}] @{ strCharRepeat(&str, '}', 0, state->wait.nowiki); fhold; } @do_nowiki_end -> start
	),

	#// placeholder...

	placeholder_start: (
		[\n] @do_line -> final | [\0] @do_null -> final | [>] -> placeholder_stop | [^\n\0>] @emit -> placeholder_start
	),
	placeholder_stop: (
		[>] -> placeholder_wait | [^>] @{ strChar(&str, '>', 0); fhold; } -> placeholder_start
	),
	placeholder_wait: (
		[>] @{ state->wait.placeholder += 1; } -> placeholder_wait | [^>] @{ strCharRepeat(&str, '>', 0, state->wait.placeholder); fhold; } @do_placeholder_end -> start
	);

	heading :=
	start: (
		[~] -> escape | [\n] @do_line -> final | [\0] @do_null -> final | [=] -> start | [^~\n\0=] @emit -> start
	),
	escape: (
		[\t 0-9A-Za-z] @emit_normal -> start | [^\t 0-9A-Za-z] @emit_escape -> start
	);

	line :=
	start: (
		[\n\0] @do_exit -> start | [\t] @{ strString(&str, "    ", 0); } -> start | [^\n\0\t] @emit -> start #// Note: @do_exit -> start should be -> final but no final state is implicitly created!
	);

	main := creole;

}%%

%% write data noerror nofinal;

int creoleParseExec(char *buffer, int size, creoleState *state, int cs)
{
	char *str = state->string; /* string builder */

	char *b = buffer, *p = buffer;
	char *pe = p + size;

	state->cs = cs;

	%% write exec;

	return p - b;
}

void creoleParseFree(creoleState *state)
{
	if (state->buffer) {
		free(state->buffer);
		state->buffer = NULL;
	}
	if (state->string) {
		free(state->string);
		state->string = NULL;
	}
}

void creoleParseInit(creoleState *state)
{
	memset(state, 0, sizeof(creoleState));
	state->string = malloc(STRINGSIZE);
	if (state->string) {
		state->buffer = malloc(BUFFERSIZE);
		if (state->buffer) {
		}
	}
	state->en_heading = creoleStateChart_en_heading;
	state->en_line = creoleStateChart_en_line;

	%% write init;
}

/****************************
 ** Creole Search Function **
 ****************************/

int creoleSearch(char *ptn, char *str, int limit) /* Searching is at least limited to the end of current line. */
{
	register int index;
	register int count;
	char *ptnscan, *strscan;

	count = limit - strlen(ptn);
	for (index = 0; index <= count; index++) {
		strscan = &str[index];
		ptnscan = ptn;
		while(*ptnscan && *ptnscan==*strscan) {
			strscan++;
			ptnscan++;
		}
		if (!*ptnscan) return index; /* 1st return. */
		if (*strscan=='\n') break; /* Enable "\n" search. */
	}
	return -1; /* 2nd return. */
}

/**************************
 ** Creole Scan Function **
 **************************/

int creoleScan(char* buffer, int size, creoleState *state)
{
	int prevLine = state->prev &~kCreoleModifierMask;
	int prevList = state->prev &~kCreoleModifier;
	int result = kCreoleDefault;

	if (prevLine == kCreolePreformatted && size >= 3 && creoleSearch("}}}", buffer, 3) == -1) { /* SC01 - loop inside preformatted block until preformatted block end found */
		result = kCreolePreformatted;
	}
	else if (prevLine == kCreolePreformatted && size >= 3 && creoleSearch("}}}", buffer, 3) == 0) {
		result = kCreolePreformattedEnd;
	}
	else if (size >= 3 && creoleSearch("{{{", buffer, 3) == 0 && creoleSearch("}}}", buffer, size) == -1) { /* SC02 - line starting with nowiki is not treated as preformatted block */
		result = kCreolePreformattedBegin;
	}
	else if (size >= 2 && creoleSearch("<<", buffer, 2) == 0 && creoleSearch(">>", buffer, size) > 0) {
		result = kCreolePlaceholder;
	}
	else if (size >= 1 && creoleSearch("|", buffer, 1) == 0) {
		result = kCreoleTableData;
	}
	else if (size >= 6 && creoleSearch("======", buffer, 6) == 0) {
		result = kCreoleHeading6;
	}
	else if (size >= 5 && creoleSearch("=====", buffer, 5) == 0) {
		result = kCreoleHeading5;
	}
	else if (size >= 4 && creoleSearch("====", buffer, 4) == 0) {
		result = kCreoleHeading4;
	}
	else if (size >= 3 && creoleSearch("===", buffer, 3) == 0) {
		result = kCreoleHeading3;
	}
	else if (size >= 2 && creoleSearch("==", buffer, 2) == 0) {
		result = kCreoleHeading2;
	}
	else if (size >= 1 && creoleSearch("=", buffer, 1) == 0) {
		result = kCreoleHeading1;
	}
	else if (size >= 4 && creoleSearch("----", buffer, 4) == 0) {
		result = kCreoleHorizontalRule;
	}
	else if (prevList >= kCreoleList4 && prevList <= kCreoleList5 && size >= 5 && creoleSearch("#####", buffer, 5) == 0) {
		result = kCreoleListOL5;
	}
	else if (prevList >= kCreoleList3 && prevList <= kCreoleList5 && size >= 4 && creoleSearch("####", buffer, 4) == 0) {
		result = kCreoleListOL4;
	}
	else if (prevList >= kCreoleList2 && prevList <= kCreoleList5 && size >= 3 && creoleSearch("###", buffer, 3) == 0) {
		result = kCreoleListOL3;
	}
	else if (prevList >= kCreoleList1 && prevList <= kCreoleList5 && size >= 2 && creoleSearch("##", buffer, 2) == 0) { /* SC03 - monospace (pre-support) */
		result = kCreoleListOL2;
	}
	else if (size >= 1 && creoleSearch("#", buffer, 1) == 0 && creoleSearch("##", buffer, 2) == -1) { /* SC04 - fall through the monospace (pre-support) test */
		result = kCreoleListOL1;
	}
	else if (prevList >= kCreoleList4 && prevList <= kCreoleList5 && size >= 5 && creoleSearch("*****", buffer, 5) == 0) {
		result = kCreoleListUL5;
	}
	else if (prevList >= kCreoleList3 && prevList <= kCreoleList5 && size >= 4 && creoleSearch("****", buffer, 4) == 0) {
		result = kCreoleListUL4;
	}
	else if (prevList >= kCreoleList2 && prevList <= kCreoleList5 && size >= 3 && creoleSearch("***", buffer, 3) == 0) {
		result = kCreoleListUL3;
	}
	else if (prevList >= kCreoleList1 && prevList <= kCreoleList5 && size >= 2 && creoleSearch("**", buffer, 2) == 0) { /* SC05 - bold */
		result = kCreoleListUL2;
	}
	else if (size >= 1 && creoleSearch("*", buffer, 1) == 0 && creoleSearch("**", buffer, 2) == -1) { /* SC06 - fall through the bold test */
		result = kCreoleListUL1;
	}
	else {
		result = (size >= 1 && creoleSearch("\n", buffer, 1) == -1) ? kCreoleParagraph : kCreoleDefault;
	}

	return result;
}

/***************************
 ** Creole Parse Function **
 ***************************/

int creoleParse(char *buffer, int size, creoleState *state, int cs)
{
	char *escapes[] = { " }}}", "~}}}" }; /* different preformatted block ends */

	parse_cb parseExec = state->parseExec;

	int changed = 0;
	int offset = 0;
	int shift = 0;

	int found = 0;
	int ltrim = 0;
	int rtrim = 0;
	int value = 0;

	int linebr = state->linebr;

	state->prev = state->curr;
	state->curr = creoleScan(buffer, size, state);
	state->linecount += 1;

	if (((state->curr &~kCreoleModifierMask) == kCreoleList) && ((state->prev &~kCreoleModifierMask) == kCreoleList)) {
		shift = (state->curr &~kCreoleModifier) - (state->prev &~kCreoleModifier);
		offset = state->curr &kCreoleMask;
	}
	else {
		changed = state->curr != state->prev;
		offset = state->curr &kCreoleMask;
	}

	if (changed || (state->curr &~kCreoleModifierMask) == kCreoleList) {
		state->bold = state->italics = state->monospace = 0;
		ECHOSTACK(state->exec.stack, state->exec.top);
	}

	switch (state->curr &~kCreoleMask) {

	case kCreoleHeading:
		ECHOSTACK(state->main.stack, state->main.top);
		value = state->curr &kCreoleMask;
		if (state->escape) {
			ECHO1("\n<h%d>", value);
			state->linebr = 0; /* Linebreaks off for this line! */
			found = parseExec(buffer, size, state, state->en_heading);
			ECHO1("</h%d>", value);
		}
		else {
			found = rtrim = creoleSearch("\n", buffer, size);
			value = ltrim = state->curr &kCreoleMask;
			while ((ltrim < rtrim) && (*(buffer + ltrim) == '=')) {
				ltrim++;
			}
			while ((rtrim > ltrim) && (*(buffer + rtrim - 1) == '=')) {
				rtrim--;
			}
			ECHO1("\n<h%d>", value);
			ECHOTEXTSIZE(buffer + ltrim, rtrim - ltrim);
			ECHO1("</h%d>", value);
		}
		break;

	case kCreoleHorizontalRule:
		found = creoleSearch("\n", buffer, size);
		ECHOSTACK(state->main.stack, state->main.top);
		ECHO("\n<hr />");
		break;

	case kCreoleListOL:
		if (changed) {
			ECHOSTACK(state->main.stack, state->main.top);
			PUSHSTACK(state->main.stack, state->main.top, "</ol>");
			ECHO("\n<ol>");
		}
		else if (shift > 0) {
			PUSHSTACK(state->main.stack, state->main.top, "</ol>");
			ECHO("<ol>");
		}
		else if (shift < 0) {
			ECHOSTACKBASE(state->main.stack, state->main.top, offset);
		}
		ECHO1("<li class=\"creole-%d\">", offset);
		state->linebr = 0; /* Linebreaks off for this line! */
		found = parseExec(buffer + offset, size - offset, state, cs) + offset;
		ECHO("</li>");
		break;

	case kCreoleListUL:
		if (changed) {
			ECHOSTACK(state->main.stack, state->main.top);
			PUSHSTACK(state->main.stack, state->main.top, "</ul>");
			ECHO("\n<ul>");
		}
		else if (shift > 0) {
			PUSHSTACK(state->main.stack, state->main.top, "</ul>");
			ECHO("<ul>");
		}
		else if (shift < 0) {
			ECHOSTACKBASE(state->main.stack, state->main.top, offset);
		}
		ECHO1("<li class=\"creole-%d\">", offset);
		state->linebr = 0; /* Linebreaks off for this line! */
		found = parseExec(buffer + offset, size - offset, state, cs) + offset;
		ECHO("</li>");
		break;

	case kCreoleParagraph:
		if (changed) {
			ECHOSTACK(state->main.stack, state->main.top);
			PUSHSTACK(state->main.stack, state->main.top, "</p>");
			ECHO("\n<p>");
		}
		found = parseExec(buffer, size, state, cs);
		break;

	case kCreolePlaceholder: /* SC07 - do not escape placeholder */
		found = creoleSearch("\n", buffer, size);
		ECHOSTACK(state->main.stack, state->main.top);
		ECHO("\n<!--");
		ECHOTEXTSIZE(buffer, found);
		ECHO("-->");
		break;

	case kCreolePreformatted:
		if (changed) {
			ECHOSTACK(state->main.stack, state->main.top);
			PUSHSTACK(state->main.stack, state->main.top, "</pre>");
			ECHO("\n<pre>");
		}
		state->linebr = 0; /* Linebreaks off for this line! */
		found = parseExec(buffer, size, state, state->en_line);

		/* To avoid treating the braces as markup for the end of the block, it needs to be indented with a single space. 
		 * Furthermore, any line consisting of only indented three closing curly braces will have one space removed 
		 * from the indentation -- to allow representing any possible text inside the preformatted block.
		 */
		ltrim = rtrim = strlen(state->string) - 4;
		value = state->escape ? 1 : 0;
		if ((ltrim >= 0) && ((rtrim = strncmp(escapes[value], state->string + ltrim, 4)) == 0)) {
			while ((ltrim > 0) && (*(state->string + ltrim - 1) == *escapes[value])) {
				ltrim--;
			}
		}
		offset = ((ltrim == 0) && (rtrim == 0)) ? 1 : 0;
		ECHO1("%s\n", state->string + offset); /* SC08 - %s\n for preformatted block lines */
		break;

	case kCreolePreformattedBegin:
		found = creoleSearch("\n", buffer, size);
		/* Echo stack not required. */
		break;

	case kCreolePreformattedEnd:
		found = creoleSearch("\n", buffer, size);
		/* Echo stack not required. */
		break;

	case kCreoleTableData:
		if (changed) {
			ECHOSTACK(state->main.stack, state->main.top);
			PUSHSTACK(state->main.stack, state->main.top, "</table>");
			ECHO("\n<table border=\"1\">");
		}
		ECHO("<tr>");
		state->linebr = 0; /* Linebreaks off for this line! */
		state->tablemarker = 1; /* Signals table line mode! */
		found = parseExec(buffer, size, state, cs);
		state->bold = state->italics = state->monospace = 0;
		ECHOSTACK(state->exec.stack, state->exec.top);
		state->tablemarker = 0;
		ECHO("</tr>");
		break;

	default: /* kCreoleDefault etc. */
		found = creoleSearch("\n", buffer, size);
		ECHOSTACK(state->main.stack, state->main.top);
		break;
	}

	state->linebr = linebr;

	return found + 1; /* + \n */
}

/*************************************
 ** Creole Echo Parse Exec Function **
 *************************************/

/*
	Echo text which would normally be passed to the machine.
	This exec function can be used in any parseExec reference.
*/

int creoleEchoParseExec(char *buffer, int size, creoleState *state, int cs)
{
	int found = creoleSearch("\n", buffer, size);
	if (cs == state->en_line) {
		strncpy(state->string, buffer, found);
		state->string[found] = '\0';
	}
	else {
		ECHOTEXTSIZE(buffer, found);
	}
	return found;
}

/*******************
 ** Main Function **
 *******************/

int main(int argc, char **argv)
{
	creoleState state;
	int have = 0, status = 0;

	parse_cb parse = creoleParse;
	parse_cb parseExec = creoleParseExec; /* creoleTestParseExec */
	state_cb parseFree = creoleParseFree; /* creoleTestParseFree */
	state_cb parseInit = creoleParseInit; /* creoleTestParseInit */

	int escape = argc >= 2 && strncmp("-escape", argv[1], 7) == 0;
	int escmax = argc >= 3 && escape && strncmp("max", argv[2], 3) == 0;
	int linebr = argc >= 2 && strncmp("-linebreaks", argv[argc - 1], 11) == 0;

	fprintf(stderr, "creole 0.1\n");

	parseInit(&state);
	if (state.buffer) {
		state.parseExec = parseExec; /* creoleEchoParseExec */

		state.escape = escape;
		state.escmax = escmax; /* not used */
		state.linebr = linebr;

		ECHO("<div id=\"creole\">");

		while (1) {
			char *data = state.buffer + have, *start, *stop, *string;
			int size, space = BUFFERSIZE - have;

			string = state.string;

			if (space == 0) {
				status = 1;
				break;
			}
			size = fread(data, 1, space, stdin);
			if ((size == 0) && (have == 0)) {
				break;
			}

			/* Find the last newline by searching backwards. This is where 
			 * we will stop processing on this iteration. If the input is end 
			 * and the input is not newline terminated then then we add a newline.
			 */
			start = state.buffer;
			stop = state.buffer + have + size - 1;
			if ((size < space) && (*stop != '\n')) {
				*(stop + 1) = '\n';
				stop += 2; /*2*/
				size += 1;
			}
			else {
				while ((*stop != '\n') && (stop >= start)) {
					stop--;
				}
				stop += 1;
			}
			while (start < stop) {
				start += parse(start, stop - start, &state, 1);
			}

			/* How much is still in the buffer. */
			have = data + size - stop;
			if (have > 0) {
				memmove(state.buffer, stop, have);
			}
			if (size < space) {
				break;
			}
		}

		ECHOSTACK(state.exec.stack, state.exec.top);
		ECHOSTACK(state.main.stack, state.main.top);
		ECHO("\n</div>\n");

		if (status == 1) {
			fprintf(stderr, "buffer out of space\n");
		}
		else if (have > 0) {
			fprintf(stderr, "input not newline terminated\n");
		}
	}
	else {
		fprintf(stderr, "buffer not allocated\n");
	}
	parseFree(&state);
	return status;
}

