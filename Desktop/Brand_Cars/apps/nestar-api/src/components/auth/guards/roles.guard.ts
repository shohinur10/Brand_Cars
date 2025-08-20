import { BadRequestException, CanActivate, ExecutionContext, Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { Message } from 'apps/nestar-api/src/libs/enums/common.enum';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private authService: AuthService,
	) {}

	async canActivate(context: ExecutionContext | any): Promise<boolean> {
		const roles = this.reflector.get<string[]>('roles', context.getHandler());
		if (!roles) return true;

		console.info(`--- @guard() Authentication [RolesGuard]: ${roles} ---`);

		if (context.contextType === 'graphql') {
			const request = context.getArgByIndex(2).req;
			const bearerToken = request.headers.authorization;
			if (!bearerToken) throw new BadRequestException(Message.TOKEN_NOT_EXISTED);

			const token = bearerToken.split(' ')[1];
			try {
				const authMember = await this.authService.verifyToken(token);
				const hasRole = () => !!authMember && roles.indexOf(authMember.memberType) > -1;
				const hasPermission: boolean = hasRole();

				if (!authMember || !hasPermission) throw new ForbiddenException(Message.ONLY_SPECIFIC_ROLES_ALLOWED);
				
				console.log('memberNick[roles] =>', authMember.memberNick);
				request.body.authMember = authMember;
				return true;
			} catch (error) {
				if (error.message.includes('expired')) {
					throw new UnauthorizedException('Token expired. Please login again.');
				}
				throw new ForbiddenException(Message.ONLY_SPECIFIC_ROLES_ALLOWED);
			}
		}

		// description => http, rpc, gprs and etc are ignored
		return false; // Default return statement for other contexts
	}
}
// roles guard
// This guard checks if the user has the required roles to access a route
// It uses the Reflector to get the roles metadata from the route handler
// If the user does not have the required roles, it throws a ForbiddenException
// If the user has the required roles, it allows access to the route
// If the context is not GraphQL, it returns false to ignore the request