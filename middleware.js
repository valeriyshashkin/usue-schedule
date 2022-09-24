import { NextResponse } from "next/server";
import slugify from "slugify";

export function middleware(request) {
  if (request.cookies.get("group")) {
    return NextResponse.redirect(
      new URL(
        `/${slugify(request.cookies.get("group")).toLowerCase()}`,
        request.url
      )
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
