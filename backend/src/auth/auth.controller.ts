import {
	Controller,
	Get,
	Post,
	Body,
	UseGuards,
	Request,
	BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
	EmailUsersService,
	GoogleUsersService,
	TelegramUsersService,
	UsersService,
} from 'src/users/users.service';
import {
	EntryAdminDto,
	EntryDto,
	IGoogleAuthDto,
	IGoogleJwtDto,
	ITelegramAuthDto,
} from './dto/entry-dto';
import { LocalAuthGuard } from './guards/local-auth-guard';
import { EmailService } from '@/email/email.service';
import { IBasicUser, RolesClass } from '@/types/types';

interface IAuthController {
	// TODO Change Interfaces abd args
	// login: (...args: any[]) => Promise<any>;
	// register: (...args: any[]) => Promise<any>;
	// getProfile: (...args: any[]) => Promise<any>;
}

@Controller('auth')
export class AuthController {
	constructor(
		protected readonly authService: AuthService,
		protected readonly usersService: UsersService,
		protected readonly emailService: EmailService,
		protected readonly emailUserService: EmailUsersService,
		protected readonly telegramUsersService: TelegramUsersService,

		protected readonly googleAuthService: GoogleUsersService,

		protected readonly jwtService: JwtService,
	) { }

	@Get('profile')
	@UseGuards(JwtAuthGuard)
	async getProfile(@Request() req) {
		return req.user;
	}
}

@Controller('/auth/email')
export class EmailAuthController
	extends AuthController
	implements IAuthController {
	@UseGuards(LocalAuthGuard)
	@Post('/login/admin')
	async loginAdmin(
		@Body() body: EntryAdminDto,
		@Request() req,
	) {
		console.log(body);
		console.log(req.user);
		const admin =
			await this.usersService.findUserById(
				req.user.userBaseId,
			);
		console.log(admin);
		return await this.authService.login(admin);
	}

	@Post('/login')
	async login(@Request() req) {
		return await this.authService.login(req.user);
	}

	@Post('/sendCode')
	async sendCode(@Body() body: EntryDto) {
		const verificationCode = Math.floor(
			100000 + Math.random() * 900000,
		).toString();
		let user: any =
			await this.emailUserService.findOne(
				body.email,
			);

		console.log(user);

		if (
			user &&
			(user.userBase.role == RolesClass.admin)
		) {
			return { checkPassword: true };
		}


		if (!user) {
			user = (
				await this.emailUserService.create(body)
			).EmailUser;
			console.log(user);
		}


		await this.emailService.createVerificationCode(user.id, verificationCode);
		await this.emailService.sendVerificationCode(user.email,verificationCode);
		return {
			message:
				'User registered successfully. Please check your email for the verification code',
			verified: false,
			userId: user.id,
			checkPassword: false,
		};
	}

	// @Post('recovery')
	// async recovery(@Body() body: { email: string }) {
	//   const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
	//   const user = await this.usersService.findValidateUserByEmail(body.email)

	//   if (!user) throw new NotFoundException('email not found')

	//   await this.emailService.createVerificationCode(user.id, verificationCode)
	//   await this.emailService.sendVerificationCode(user.email, verificationCode)

	//   return {
	//     userId: user.id
	//   }
	// }

	@Post('verify')
	async verify(
		@Body()
		body: {
			userId: string;
			code: string;
		},
	) {
		console.log(body);
		const result = await this.emailService.verifyCode(
			body.userId,
			body.code,
		)
		if (!result) throw new BadRequestException('Invalid or expired verification code');
		const validUser = await this.usersService.findEmailUserByIdAndReturnBase(body.userId)

		console.log(validUser)

		return await this.authService.login(validUser);
	}

	// @Patch('changePassword')
	// async changePassword(
	// 	@Body()
	// 	body: {
	// 		newPassword: string;
	// 		email: string;
	// 	},
	// ) {
	// 	// const existingUserId = (await this.usersService.findOne(body.email)).id
	// 	// return await this.usersService.changePassword(existingUserId, body.newPassword);
	// }
}

@Controller('/auth/telegram')
export class TelegramAuthController extends AuthController {
	@Post('/login')
	async login(
		@Body() telegramData: ITelegramAuthDto,
	) {
		console.log(telegramData);
		const user =
			await this.telegramUsersService.findOrCreate(
				telegramData,
			);
		return await this.authService.login(user);
	}
}

@Controller('/auth/google')
export class GoogleAuthController extends AuthController {
	@Post('/login')
	async login(@Body() googleData: IGoogleJwtDto) {
		console.log("start decode")

		const decodedData: IGoogleAuthDto =
			this.jwtService.decode(
				googleData.credential,
			);
		console.log(decodedData);

		const user =
			await this.googleAuthService.findOrCreate(
				decodedData,
			);

		console.log(user);
		return await this.authService.login(user);
	}
}
